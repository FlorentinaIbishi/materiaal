sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/Device',
    'sap/f/library',
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/model/Filter',
    'sap/ui/export/Spreadsheet',
    'sap/ui/export/library'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Device, fioriLibrary, Sorter, Fragment, Filter, Spreadsheet, exportLibrary) {
        "use strict";

        return Controller.extend("ap.be.materiaal.controller.main", {
            onInit: function () {
                 // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
			    this._mViewSettingsDialogs = {};
            },

            onListItemPress: function () {
                var oFCL = this.oView.getParent().getParent();

                oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
            },
            handleSortButtonPressed: function () {
                this.getViewSettingsDialog("ap.be.materiaal.fragments.sortDialog")
                    .then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
            },
            getViewSettingsDialog: function (sDialogFragmentName) {
                var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

                if (!pDialog) {
                    pDialog = Fragment.load({
                        id: this.getView().getId(),
                        name: sDialogFragmentName,
                        controller: this
                    }).then(function (oDialog) {
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        return oDialog;
                    });
                    this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
                }
                return pDialog;
            },
            handleSortDialogConfirm: function (oEvent) {
                var oTable = this.byId("materialTable"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    sPath,
                    bDescending,
                    aSorters = [];

                sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new Sorter(sPath, bDescending));

                // apply the selected sort and group settings
                oBinding.sort(aSorters);
            },
            handleFilterButtonPressed: function () {
                this.getViewSettingsDialog("ap.be.materiaal.fragments.filterDialog")
                    .then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
            },
            handleFilterDialogConfirm: function (oEvent) {
                var oTable = this.byId("materialTable"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    aFilters = [];

                mParams.filterItems.forEach(function(oItem) {
                    let sPath = oItem.getParent().getKey(),
                        sOperator = 'EQ',
                        sValue1 = oItem.getKey(),
                        oFilter = new Filter(sPath, sOperator, sValue1);
                    aFilters.push(oFilter);
                });

                // apply filter settings
                oBinding.filter(aFilters);

                // update filter bar
                // this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
                // this.byId("vsdFilterLabel").setText(mParams.filterString);
            },
            onExport: function(oEvent) {
                let aCols, oRowBinding, oSettings, oSheet, oTable;


                oTable = this.getView().byId("materialTable")
                oRowBinding = oTable.getBinding('items')
                aCols = this.createColumnConfig()

                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'Table export materiaal.xlsx',
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
            },
            createColumnConfig: function() {
                let aCols = []
                let EdmType = exportLibrary.EdmType

                aCols.push({
                    label: 'Id',
                    property: ['Matnr'],
                    type: EdmType.String,
                    template: 'Materiaal - {0}'
                });

                aCols.push({
                    label: 'Matnr',
                    type: EdmType.String,
                    property: 'Matnr',
                    scale: 0
                });

                aCols.push({
                    property: 'MatDescription',
                    type: EdmType.String
                });

                aCols.push({
                    property: 'Matkl',
                    type: EdmType.String
                });
                aCols.push({
                    property: 'Mtart',
                    type: EdmType.String
                });

                return aCols;
            },
        });
    });

