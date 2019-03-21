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
		},
	});
});