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
			var oviewModel = this.getModel("viewModel");
			if (oviewModel.getProperty("/mockData")) {
				var aAddress = oModel.getProperty("/adressen");
				var aFields = this.getView().byId("form").getContent();
				aFields.forEach(function (f) {
					if (f.getId().match(/Input/)) {
						var sId = f.getId();
						var sValue = f.getValue();
						console.log(sId, sValue);
					}
				});
			} else {

				// var sLocalPath,
				// 	sUrl = "./webapp/php/getData.php/",
				// 	sPath = this.getView().getBindingContext().getProperty("addrid"),
				// 	oModel = this.getModel(),
				// 	oObject = this.getView().getBindingContext().getProperty(),
				// 	that = this;

				var oFields = new Array, sId, sField, sUrl, sLocalPath, sPath;
				var aFields = this.getView().byId("form").getContent();
				
				oFields["addrid"] = this.getView().getBindingContext().getPath().split("/").pop();
				aFields.forEach(function(field,index) {
					sId = field.getId().split("--")[1];
					if (sId.match(/Input/)) {
						sField = sId.replace(/Input/,"").trim();
						oFields[sField] = field.getValue();
						if (sField === 'name') {
							oFields["firstletter"] = oFields["name"].substr(0,1);
						}
					}
				});
				

				//check if we're in edit or createMode			    
				if (!this.getModel("viewModel").getProperty("/createMode")) {
					//we're not, so we update an existing entry
					sUrl = sUrl + sPath + "/";
					sLocalPath = sPath;
				}

				// oModel.saveEntry(oObject, sUrl, sLocalPath);

				oModel.attachEventOnce("requestCompleted", function () {
					that.getRouter().navTo("master");
				}, this);

				oModel.attachEventOnce("requestFailed", function () {
					MessageToast.show(that.getResourceBundle().getText("updateFailed"));
				}, this);

			}

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
				name: "",
				adresse: "",
				plz_ort: "",
				ort: "",
				telefonp1: "",
				telefong1: ""
			};
			oAdressen.push(oEntry);
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