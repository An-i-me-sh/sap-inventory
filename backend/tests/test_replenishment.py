import sys
import os
import unittest

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.recommendation_service import RecommendationService
from app.services.inventory_service import InventoryService

class TestReplenishmentLogic(unittest.TestCase):
    def test_replenishment_recommendation_formula(self):
        """
        REQUIRED BUSINESS LOGIC TEST (Section 53):
        Current stock = 100
        Incoming stock = 20
        Forecast demand = 180
        Safety stock = 30
        
        Expected:
        Available = 120
        Required = 210
        Recommendation = 90
        """
        calc = RecommendationService.calculate_replenishment(
            current_stock=100.0,
            incoming_stock=20.0,
            predicted_demand=180.0,
            safety_stock=30.0
        )

        self.assertEqual(calc["available_stock"], 120.0)
        self.assertEqual(calc["required_stock"], 210.0)
        self.assertEqual(calc["recommended_order"], 90.0)

    def test_stock_status_classification_rules(self):
        """
        Test Section 11 Stock Status rules:
        CRITICAL: current stock < 50% of min stock
        LOW: current stock < min stock
        HEALTHY: min stock <= current stock <= max stock
        OVERSTOCK: current stock > max stock
        """
        min_stock = 100.0
        max_stock = 1000.0

        self.assertEqual(InventoryService.calculate_stock_status(40.0, min_stock, max_stock), "CRITICAL")
        self.assertEqual(InventoryService.calculate_stock_status(80.0, min_stock, max_stock), "LOW")
        self.assertEqual(InventoryService.calculate_stock_status(500.0, min_stock, max_stock), "HEALTHY")
        self.assertEqual(InventoryService.calculate_stock_status(1200.0, min_stock, max_stock), "OVERSTOCK")

if __name__ == "__main__":
    unittest.main()
