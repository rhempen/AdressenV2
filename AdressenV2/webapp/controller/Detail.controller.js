sap.ui.define([
	"OpenUI5/AdressenV2/controller/BaseController",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("OpenUI5.AdressenV2.controller.Detail", {

		/* =========================================================================== */
		/* lifecycle methods
		/* =========================================================================== */

		/**
		 *	Called when the worklist controller is instantiated
		 * @public
		 */
		onInit: function () {
			this.getRouter().attachRoutePatternMatched(this._onRouteMatched, this);
		},

		onEdit: function (oEvent) {
			var sObjectPath = this.getView().getElementBinding().getPath(); //.substr(11);
			// we need to strip the leading slashes from the path to get the ID
			this.getRouter().navTo("edit", {
				addrid: sObjectPath.replace(/\D/g, '')
			}, true);
		},

		onDelete: function () {
			var oModel = this.getModel(),
				sLocalPath = this.getView().getElementBinding().getPath(),
				oObject = oModel.getProperty(sLocalPath),
				sUrl = "./webapp/php/getData.php/" + oObject.addrid + "/",
				that = this;

			oModel.deleteEntry(sUrl, oObject.addrid);

			oModel.attachEventOnce("requestCompleted", function () {
				that.getRouter().navTo("master");
			}, this);

			oModel.attachEventOnce("requestFailed", function () {
				MessageToast.show(that.getResourceBundle().getText("updateFailed"));
			});
		},

		/* =========================================================================== */
		/* event handlers
		/* =========================================================================== */

		/**
		 *	Called when back Button in Detail is hit, navigates back to the master
		 * @function
		 */
		onNavPress: function (oEvent) {
			this.myNavBack("master");
		},

		onPageUp: function (oEvent) {
			var sID = oEvent.getSource().getBindingContext().getPath();
			sID = parseInt(sID.substr(sID.lastIndexOf("/") + 1), 0);
			if (sID > 0) {
				sID = sID - 1;
				this.getRouter().navTo("detail", {
					addrid: sID
				});
			} else {
				sap.m.MessageToast.show("Keine weitere Adresse!");
			}
		},

		onPageDown: function (oEvent) {
			var sID = oEvent.getSource().getBindingContext().getPath();
			var iAnzAdressen = this.getView().getModel().getProperty("/adressen").length;
			sID = parseInt(sID.substr(sID.lastIndexOf("/") + 1), 0);
			sID = sID + 1;
			if (sID < iAnzAdressen) {
				this.getRouter().navTo("detail", {
					addrid: sID
				});
			} else {
				sap.m.MessageToast.show("Keine weitere Adresse!");
			}
		},

		/* =========================================================================== */
		/* formatters Example in Controller
		/* =========================================================================== */
		toLowerCase: function (sName) {
			return sName && sName.toLowerCase();
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
		/**
		 * Binds the view to the object path.
		 *
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onRouteMatched: function (oEvent) {
			if (oEvent.getParameter("name") === "detail") {
				this.sObjectId = oEvent.getParameter("arguments").addrid;
				this.getView().setModel(sap.ui.getCore().getModel());
				this.getView().bindElement("/adressen/" + this.sObjectId);
			}
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
			oView.bindElement("/adressen/" + this.sObjectId);
		},

		_updateViewModel: function (oEvent) {
			var sObjectID = oEvent.getParameter("arguments").addrid;
			// find out if there is a next object in the line:
			var oModel = this.getView().getModel();
			var oViewModel = this.getView().getModel("viewModel");
			var nextObjectId = parseInt(sObjectID) + 1;
			var prevObjectId = parseInt(sObjectID) - 1;

			// check if there is a next object by adding +1 to the adressen ID 
			// we assume we get a field we can safely order from the server
			var bNext = !!oModel.getProperty("/adressen/" + nextObjectId);
			var bPrev = !!oModel.getProperty("/adressen/" + prevObjectId);
			oViewModel.setProperty("/buttonNext", bNext);
			oViewModel.setProperty("/buttonPrev", bPrev);

		}

	});
});