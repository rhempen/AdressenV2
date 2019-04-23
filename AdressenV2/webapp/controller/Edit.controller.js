sap.ui.define([
	"OpenUI5/AdressenV2/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"

], function (Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("OpenUI5.AdressenV2.controller.Edit", {

		/* =========================================================================== */
		/* lifecycle methods
		/* =========================================================================== */

		/**
		 *	Called when the worklist controller is instantiated
		 * @public
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			this.getView().setModel(sap.ui.getCore().getModel("viewModel"), "viewModel");
			oRouter.attachRoutePatternMatched(this._onRouteMatched, this);
		},

		/* =========================================================================== */
		/* event handlers
		/* =========================================================================== */

		/**
		 *	Called when back Button in Detail is hit, navigates back to the master
		 * @function
		 */
		onNavPress: function () {
			this.onCancel();
			// this.myNavBack("master");
		},

		onSave: function (oEvent) {
			var oModel = this.getModel();
			var oAdressen = oModel.getProperty("/adressen");
			var sCreate = this.getModel("viewModel").getProperty("/createMode");
			var sPath = this.getView().getBindingContext().getPath();
			var oRow = {},
				sId, sField, lFieldname;
			var aFields = this.getView().byId("form").getContent();

			oRow.addrid = this.getView().getBindingContext().getPath().split("/").pop();
			oRow.addrid = this.sNextAddrid;
			oRow.bild = "";
			oRow.emailg1 = "";
			oRow.emailp1 = "";
			oRow.geburtstag = "";
			oRow.geschlecht = "";
			oRow.notizen = "";
			oRow.ort = "";
			oRow.websiteg1 = "";
			oRow.websitep1 = "";
			// aFields.forEach(function (field, index) {
			// 	sId = field.getId().split("--")[1];
			// 	if (sId.match(/Input/)) {
			// 		sField = sId.replace(/Input/, "").trim();
			// 		oRow[sField] = field.getValue();
			// 		if (sField === 'name') {
			// 			oRow.firstletter = oRow.name.substr(0, 1);
			// 		}
			// 	}
			// });

			aFields.forEach(function (field, index) {
				sId = field.getId().split("--")[1];
				// oRow = oModel.getProperty(sPath);
				if (sId.match(/Input/)) {
					sField = sId.replace(/Input/, "").trim();
					// oRow[sField] = field.getValue();
					if (sField === "name") {
						oRow.firstletter = field.getValue().substr(0,1);
					}
					if (sField === "plz_ort") {
						oRow.ort = field.getValue().split(" ")[1] ? field.getValue().split(" ")[1] : "";
					}

					if (sCreate) {
						lFieldname = sField;
						oRow[lFieldname] = field.getValue();
					} else {
						oModel.setProperty(sPath + "/" + sField, field.getValue());
					}
				}
			});
			
			if (sCreate) {
				oAdressen.push(oRow);
				oModel.setProperty("/adressen", oAdressen);
			}

			var opt = {
				bAppend: sCreate ? true : false,
				bUpdate: sCreate ? false : true
			};
			this.fillAddressDB(opt);

			this.getRouter().navTo("master");

			// MessageToast.show(that.getResourceBundle().getText("updateFailed"));

			//check if we're in edit or createMode			    
			// if (!this.getModel("viewModel").getProperty("/createMode")) {
			// 	//we're not, so we update an existing entry
			// 	sUrl = sUrl + sPath + "/";
			// 	sLocalPath = sPath;
			// }

			// oModel.saveEntry(oObject, sUrl, sLocalPath);

			// oModel.attachRequestCompleted(function(oEvent1) {
			// 	that.getRouter().navTo("master");
			// }, this);

			// oModel.attachEventOnce("requestFailed", function () {
			// 	MessageToast.show(that.getResourceBundle().getText("updateFailed"));
			// }, this);

			// }

		},

		onCancel: function () {
			if (this.sObjectPath.match(/create/)) {
				this.getModel().getProperty("/adressen").pop(); // den letzten Satz wieder löschen
				this.myNavBack("master");
			} else {
				var sAddrid = this.sObjectPath.substring(1);
				this.myNavBack("detail", {
					addrid: sAddrid
				});
			}

		},

		/* =========================================================================== */
		/* internal methods
		/* =========================================================================== */

		/**
		 *	Bindes the View to the object path
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match vent in route 'object'
		 * @pivate
		 */
		_onRouteMatched: function (oEvent) {
			var oEventData = oEvent.getParameter("arguments");
			if (oEvent.getParameter("name") === "master") {
				return;
			}
			if (oEventData && oEventData.addrid) {
				this.getView().getModel("viewModel").setProperty("/createMode", false);
				this.sObjectPath = "/" + oEventData.addrid;
			} else {
				this.getView().getModel("viewModel").setProperty("/createMode", true);
				this._createNewEntry();
				// this.getModel().createEntry("/");
				this.sObjectPath = "/createEntry";
			}
			this._bindView();
		},

		/**
		 * Create a new Entry in Property adressen
		 * @function
		 * @param 
		 * @private
		 */
		_createNewEntry: function () {
			var oAdressen = sap.ui.getCore().getModel().getProperty("/adressen");
			// this._sortByAddrid(oAdressen);
			var oEntry = {
				addrid: this._getHighestAddrid(),
				adresse: "",
				bild: "",
				emailg1: "",
				emailp1: "",
				firstletter: "",
				geburtstag: "",
				geschlecht: "",
				name: "",
				notizen: "",
				ort: "",
				plz_ort: "",
				telefonp1: "",
				telefong1: "",
				websiteg1: "",
				websitep1: ""
			};
			// oAdressen.push(oEntry);
		},

		/**
		 * Get highest Addrid von Property adressen
		 * @function
		 * @param 
		 * @private
		 */
		_getHighestAddrid: function () {
			var oAdressen = sap.ui.getCore().getModel().getProperty("/adressen");
			var maxAddrid = 0;
			oAdressen.map(function (e) {
				if (parseInt(e.addrid) > maxAddrid) {
					maxAddrid = parseInt(e.addrid);
				}
			});
			this.sNextAddrid = maxAddrid + 1;
			return this.sNextAddrid;
		},

		_sortByAddrid: function (oAdressen) {
			oAdressen.sort(function (a, b) {
				return parseInt(a.addrid) === parseInt(b.addrid) ? 0 : +(a.addrid > b.addrid) || -1;
			});
		},

		/**
		 * Binds the view to the object path.
		 *
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function () {
			var oView = this.getView();
			oView.setModel(sap.ui.getCore().getModel());
			if (this.sObjectPath === "/createEntry") {
				oView.bindElement("/adressen/" + this.sNextAddrid);
			} else {
				oView.bindElement("/adressen" + this.sObjectPath);
			}
		}
	});
});