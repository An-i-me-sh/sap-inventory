*----------------------------------------------------------------------*
* Program Name: ZINVENTORY_EXPORT                                      *
* Description : SAP ABAP Material & Stock Data Extraction for REST/OData *
* Author      : SAP Integration Team                                   *
*----------------------------------------------------------------------*
REPORT zinventory_export.

TYPES: BEGIN OF ty_inventory,
         matnr TYPE mara-matnr,
         maktx TYPE makt-maktx,
         werks TYPE mard-werks,
         lgort TYPE mard-lgort,
         labst TYPE mard-labst,
         insme TYPE mard-insme,
         speme TYPE mard-speme,
         meins TYPE mara-meins,
       END OF ty_inventory.

DATA: gt_inventory TYPE TABLE OF ty_inventory,
      gs_inventory TYPE ty_inventory,
      gv_json      TYPE string.

SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE TEXT-001.
SELECT-OPTIONS: s_werks FOR gs_inventory-werks DEFAULT '1000' TO '3000',
                s_matnr FOR gs_inventory-matnr.
SELECTION-SCREEN END OF BLOCK b1.

START-OF-SELECTION.
  SELECT a~matnr, b~maktx, c~werks, c~lgort, c~labst, c~insme, c~speme, a~meins
    INTO CORRESPONDING FIELDS OF TABLE @gt_inventory
    FROM mara AS a
    INNER JOIN makt AS b ON a~matnr = b~matnr
    INNER JOIN mard AS c ON a~matnr = c~matnr
    WHERE b~spras = @sy-langu
      AND c~werks IN @s_werks
      AND a~matnr IN @s_matnr.

  IF sy-subrc = 0.
    " Serialize internal table to JSON for OData / FastAPI Service Consumption
    gv_json = /ui2/cl_json=>serialize( data = gt_inventory compress = abap_true pretty_name = /ui2/cl_json=>pretty_mode-low_case ).
    
    WRITE: / 'Successfully extracted', lines( gt_inventory ), 'inventory records.'.
    WRITE: / 'Payload JSON Preview:', gv_json(250).
  ELSE.
    WRITE: / 'No inventory records found for selected criteria.'.
  ENDIF.
