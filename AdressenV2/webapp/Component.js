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
			var that = this;

			var o18nModel = this.getModel("i18n");
			sap.ui.getCore().setModel(o18nModel, "i18n");

			var oModel = new sap.ui.model.json.JSONModel();
			this.setModel(oModel);

			// load adressen from json-file
			if (window.location.hash === "#mock") {
				$.ajax({
					url: "webapp/model/adressen.json",
					dataType: "json",
					success: function (data) {
						that.getModel().setProperty("/adressen", data.adressen);
					}
				});
			} else {
				that.getModel().setProperty("/adressen", []);
			}

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "Device");
		}

	});
});