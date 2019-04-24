sap.ui.define([
	"OpenUI5/AdressenV2/controller/BaseController"

], function (Controller) {
	"use strict";

	return Controller.extend("OpenUI5.AdressenV2.controller.Master", {
		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var that = this;
			var oModel;

			this.loadInitialData(function (data) {
				oModel = sap.ui.getCore().getModel();
				that.getView().setModel(oModel);
			});

			this.getRouter().attachRoutePatternMatched(this.onRoutePatternMatched, this);

			this.getView().attachEventOnce("afterRendering", function (oEvent) {
				// var oParams = oEvent.getParameters();
			});

		},

		onRoutePatternMatched: function (oEvent) {
			var sName = oEvent.getParameter("name");
			if (sName !== "master") {
				return;
			}

			var oModel = sap.ui.getCore().getModel();
			var oAdressen = oModel.getProperty("/adressen");
			if (oAdressen) {
				oModel.setProperty("/msg", oAdressen.length);
			}
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onListPress: function (oEvent) {

			//			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
			//				  productPath = oEvent.getSource().getBindingContext("adressen").getPath(),
			//				  product = productPath.split("/").slice(-1).pop();

			this._showObject(oEvent.getSource());
		},

		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Fiori Launchpad home page
		 *
		 * @public
		 */
		onNavBack: function () {
			// The history contains a previous entry
			window.history.go(-1);
		},

		/**
		 * Sync the current Addresses into the address.json file.
		 *
		 * @public
		 */
		onSynchronize: function () {
			// First read Addresses from IndexDB and fill Entity oAdressen
			this.readAddressDB();
			var oAdressen = this.getModel().getProperty("/adressen");
			
			// Store data in the Local Storage of the Browser
			var oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			oJQueryStorage.put("adressen", oAdressen);
			// Read data from the Local Storage 
			var oAdressenFromLocalStorage = oJQueryStorage.get("adressen");
			
			// Store data in the Session Storage of the Browser
			sessionStorage.setItem("adressen", JSON.stringify(oAdressen));
			// Read data from the Session Storage 
			var oAdressenFromSessionStorage = JSON.parse(sessionStorage.getItem("adressen"));
			
			// Store data in a WebSQL-Database
			// Siehe http://html5doctor.com/introducing-web-sql-databases/
			var myWebDB = openDatabase("adressen", "1.0", "meine Adressen", 2 * 1024 * 1024);
			myWebDB.transaction(function (tx) {
				tx.executeSql("DROP TABLE IF EXISTS adressen");
				tx.executeSql("CREATE TABLE IF NOT EXISTS adressen (addrid unique, name, adresse, plz_ort)");
				oAdressen.forEach(function(item) {
					tx.executeSql("INSERT INTO adressen (addrid, name, adresse, plz_ort) VALUES (?,?,?,?)", [item.addrid, item.name, item.adresse, item.plz_ort]);
				});
			});
			
		},

		/**
		 * Add a new Address
		 *
		 * @public
		 */
		onAddAddress: function () {
			this.getRouter().navTo("edit");
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			var oBindingContext = oItem.getBindingContext();
			this.getRouter().navTo("detail", {
				addrid: oBindingContext.getPath().substr(10) //getProperty("addrid")
			});
		}
	});
});