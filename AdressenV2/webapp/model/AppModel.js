sap.ui.define([
	"sap/ui/model/json/JSONModel"

], function (JSONModel) {
	"use strict";

	return JSONModel.extend("OpenUI5.AdressenV2.AppModel", {

		saveEntry: function (oObject, sUrl, sLocalPath) {
			var sType,
				that = this;

			// local path indicates whether we are updating an existing object or creating a new one
			if (sLocalPath) {
				sType = "PUT";
			} else {
				sType = "POST";
			}

			// var oData = JSON.stringify(oObject);
			var oData = oObject;
			jQuery.ajax({
				type: sType,
				contentType: "application/json",
				data: oData,
				url: sUrl,
				success: function () {
					that._updateModel(sLocalPath, oObject);
					//call createEntry to reset the dummy property to empty values
					that.createEntry("/");
					that.fireRequestCompleted();
				},
				error: function () {
					that.fireRequestFailed();
				}
			});
		},

		createEntry: function (sEntityName) {
			this.setProperty(sEntityName + "/createEntry", {
				"addrid": "",
				"name": "",
				"firstletter": "",
				"adresse": "",
				"plz_ort": "",
				"ort": "",
				"geschlecht": "",
				"geburtstag": "",
				"bild": "",
				"telefonp1": "",
				"telefong1": "",
				"emailp1": "",
				"emailg1": "",
				"websitep1": "",
				"websiteg1": "",
				"notizen": ""
			});
		},

		deleteEntry: function (sUrl, sLocalPath) {
			var that = this;
			jQuery.ajax({
				url: sUrl,
				type: "DELETE",
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",
				dataType: "json",
				data: sLocalPath,
				async: false,
				success: function () {
					//store the new/updated entry in the model
					that._updateModel(sLocalPath, null, true);
					that.fireRequestCompleted();
				},
				error: function () {
					that.fireRequestFailed();
				}
			});
		},

		_updateModel: function (sLocalPath, data, bDelete) {
			var aData = this.getData();
			if (sLocalPath && bDelete) {
				//remove from model
				aData.adressen.splice(sLocalPath, 1);
				this.setData(aData);
				this.refresh();
			} else if (sLocalPath) {
				//store data for an existing object
				this.setProperty(sLocalPath, data);
			} else {
				//store new object: get all Data as array from model, push new entry, set data to the model again
				aData = this.getData();
				aData.push(data);
				this.setData(aData);
			}
		}
	});
});