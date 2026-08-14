*----------------------------------------------------------------------*
* Program Name: ZPURCHASE_ORDER_EXPORT                                 *
* Description : SAP ABAP Purchase Orders Data Extraction for OData     *
* Author      : SAP Integration Team                                   *
*----------------------------------------------------------------------*
REPORT zpurchase_order_export.

TYPES: BEGIN OF ty_po,
         ebeln TYPE ekko-ebeln,
         ebelp TYPE ekpo-ebelp,
         matnr TYPE ekpo-matnr,
         lifnr TYPE ekko-lifnr,
         werks TYPE ekpo-werks,
         aedat TYPE ekko-aedat,
         eindt TYPE eket-eindt,
         menge TYPE ekpo-menge,
         netpr TYPE ekpo-netpr,
       END OF ty_po.

DATA: gt_po   TYPE TABLE OF ty_po,
      gv_json TYPE string.

START-OF-SELECTION.
  SELECT a~ebeln, b~ebelp, b~matnr, a~lifnr, b~werks, a~aedat, c~eindt, b~menge, b~netpr
    INTO CORRESPONDING FIELDS OF TABLE @gt_po
    FROM ekko AS a
    INNER JOIN ekpo AS b ON a~ebeln = b~ebeln
    LEFT OUTER JOIN eket AS c ON b~ebeln = c~ebeln AND b~ebelp = c~ebelp
    WHERE a~bstyp = 'F'
      AND b~loekz = @space.

  IF sy-subrc = 0.
    gv_json = /ui2/cl_json=>serialize( data = gt_po compress = abap_true pretty_name = /ui2/cl_json=>pretty_mode-low_case ).
    WRITE: / 'Successfully extracted', lines( gt_po ), 'purchase order records.'.
  ENDIF.
