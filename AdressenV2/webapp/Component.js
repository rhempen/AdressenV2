sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"OpenUI5/AdressenV2/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("OpenUI5.AdressenV2.Component", {
		metadata: {
			manifest: "json"
		},

		init: function () {
			var o18nModel = this.getModel("i18n");
			sap.ui.getCore().setModel(o18nModel, "i18n");
			
			var oModel = new sap.ui.model.json.JSONModel({});
			oModel.setDefaultBindingMode("TwoWay");
			sap.ui.getCore().setModel(oModel);
			
			var oViewModel = new sap.ui.model.json.JSONModel({
				"createMode": false,
				"mockData": window.location.hash === "#mock" ? true : false
			});
			sap.ui.getCore().setModel(oViewModel, "viewModel");

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "Device");
		}
	});
});