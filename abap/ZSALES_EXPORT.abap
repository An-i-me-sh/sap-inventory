*----------------------------------------------------------------------*
* Program Name: ZSALES_EXPORT                                          *
* Description : SAP ABAP Billing & Sales History Data Extraction        *
* Author      : SAP Integration Team                                   *
*----------------------------------------------------------------------*
REPORT zsales_export.

TYPES: BEGIN OF ty_sales,
         vbeln TYPE vbrk-vbeln,
         fkdat TYPE vbrk-fkdat,
         matnr TYPE vbrp-matnr,
         werks TYPE vbrp-werks,
         fkimg TYPE vbrp-fkimg,
         vrkme TYPE vbrp-vrkme,
         netwr TYPE vbrp-netwr,
         kunrg TYPE vbrk-kunrg,
       END OF ty_sales.

DATA: gt_sales TYPE TABLE OF ty_sales,
      gv_json  TYPE string.

SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE TEXT-001.
SELECT-OPTIONS: s_fkdat FOR sy-datum DEFAULT sy-datum - 90 TO sy-datum.
SELECTION-SCREEN END OF BLOCK b1.

START-OF-SELECTION.
  SELECT a~vbeln, a~fkdat, b~matnr, b~werks, b~fkimg, b~vrkme, b~netwr, a~kunrg
    INTO CORRESPONDING FIELDS OF TABLE @gt_sales
    FROM vbrk AS a
    INNER JOIN vbrp AS b ON a~vbeln = b~vbeln
    WHERE a~fkdat IN @s_fkdat
      AND a~fksto = @space.

  IF sy-subrc = 0.
    gv_json = /ui2/cl_json=>serialize( data = gt_sales compress = abap_true pretty_name = /ui2/cl_json=>pretty_mode-low_case ).
    WRITE: / 'Successfully extracted', lines( gt_sales ), 'sales records.'.
  ENDIF.
