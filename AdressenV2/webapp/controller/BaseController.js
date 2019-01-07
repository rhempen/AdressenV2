sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"

], function (Controller, History) {
	"use strict";

	return Controller.extend("OpenUI5.AdressenV2.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		getEventBus: function () {
			return sap.ui.getCore().getEventBus();
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to a route passed to this function.
		 *
		 * @public
		 * @param {string} sRoute the name of the route if there is no history entry
		 * @param {object} mData the parameters of the route, if the route does not need parameters, it may be omitted.
		 */
		myNavBack: function (sRoute, mData) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sRoute === "master") {
				var bReplace = false;
				this.getRouter().navTo(sRoute, mData, bReplace);
			}
			
			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				/*eslint-disable */
				window.history.go(-1);
				/*eslint-enable */
			} else {
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getRouter().navTo(sRoute, mData, bReplace);
			}
		},
		
		loadInitialData: function(callback) {
			var that = this;
			var oModel = new sap.ui.model.json.JSONModel();
			// Run with Mockdata or Not?
			window.location.hash = "#mock";
			if (window.location.hash !== "#mock") {
				jQuery.ajax({
					type: "GET",
					contentType: "application/json",
					url: "webapp/php/getData.php/all/",
					dataType: "json",
					success: function (oData) {
						oModel.setData(oData);
						sap.ui.getCore().setModel(oModel);
					},
					error: function (oData) {
						console.log("an error occurred retrievieng the Data");
					}
				});
			} else {
				$.ajax({
					url: "webapp/model/adressen.json",
					dataType: "json",
					success: function (data) {
						oModel.setProperty("/adressen", data.adressen);
						oModel.setProperty("/msg", data.msg);
						sap.ui.getCore().setModel(oModel);
						if (callback) callback.apply(this, arguments);
					},
					error: function (data, textStatus, jqXHR) {
						console.log("an error occurred retrievieng the Data " + textStatus);
					}
				});
			}
		}
	});
});