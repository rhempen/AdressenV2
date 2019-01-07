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
			var oViewModel = new JSONModel({
				"createMode": false
			});
			this.getView().setModel(oViewModel, "viewModel");

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

		onSave: function () {
			var sLocalPath,
				sUrl = "./webapp/php/getData.php/",
				sPath = this.getView().getBindingContext().getProperty("addrid"),
				oModel = this.getModel(),
				oObject = this.getView().getBindingContext().getProperty(),
				that = this;

			//check if we're in edit or createMode			    
			if (!this.getModel("viewModel").getProperty("/createMode")) {
				//we're not, so we update an existing entry
				sUrl = sUrl + sPath + "/";
				sLocalPath = sPath;
			}

			oModel.saveEntry(oObject, sUrl, sLocalPath);

			oModel.attachEventOnce("requestCompleted", function () {
				that.getRouter().navTo("master");
			}, this);

			oModel.attachEventOnce("requestFailed", function () {
				MessageToast.show(that.getResourceBundle().getText("updateFailed"));
			}, this);

		},

		onCancel: function () {
			if (this.sObjectPath.match(/create/)) {
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
				telefong1: "",
				mode: "create"
			};
			oAdressen.push(oEntry);
		},

		/**
		 * Get highest Addrid von Property adressen
		 * @function
		 * @param 
		 * @private
		 */
		_getHighestAddrid: function() {
			var oAdressen = sap.ui.getCore().getModel().getProperty("/adressen");
			var maxAddrid = 0;
			oAdressen.map(function(e) { 
				if (parseInt(e.addrid) > maxAddrid) {
					maxAddrid = parseInt(e.addrid);
				}
			});
			this.sNextAddrid = maxAddrid + 1;
			return maxAddrid++;
		},

		_sortByAddrid: function(oAdressen) {
			oAdressen.sort(function(a, b){
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