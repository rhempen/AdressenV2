sap.ui.define([
	"OpenUI5/AdressenV2/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
	
], function(Controller, JSONModel, MessageToast) {
	"use strict";
	
	return Controller.extend("OpenUI5.AdressenV2.controller.Edit", {
		
		/* =========================================================================== */
		/* lifecycle methods
		/* =========================================================================== */
		
		/**
		*	Called when the worklist controller is instantiated
		* @public
		*/
		onInit: function() {
						
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
		onNavPress: function(){
			this.myNavBack("master");
		},
		
		onSave: function(){
			var sLocalPath,
			    sUrl = "./webapp/php/getData.php/",
			    sPath = this.getView().getBindingContext().getProperty("addrid"),
			    oModel = this.getModel(),
			    oObject = this.getView().getBindingContext().getProperty(),
			    that = this;

			//check if we're in edit or createMode			    
			if(!this.getModel("viewModel").getProperty("/createMode")){
				//we're not, so we update an existing entry
				sUrl = sUrl+sPath+"/";
				sLocalPath = sPath;
			}
			
			oModel.saveEntry(oObject, sUrl, sLocalPath);
			
			oModel.attachEventOnce("requestCompleted", function(){
				that.getRouter().navTo("master");
			}, this);
			
			oModel.attachEventOnce("requestFailed", function(){
				MessageToast.show(that.getResourceBundle().getText("updateFailed"));
			}, this);
			
		},
		
		onCancel : function(){
			this.myNavBack("master");
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
		_onRouteMatched : function (oEvent) {
			var oEventData = oEvent.getParameter("arguments");
			if (oEvent.getParameter("name")==="master"){
			    return;
			}
			if(oEventData && oEventData.addrid){
				this.sObjectPath = "/" + oEventData.addrid;
			} else {
				this.getView().getModel("viewModel").setProperty("/createMode", true);
				this.getModel().createEntry("/");
				this.sObjectPath = "/createEntry";
			}
			this._bindView();
		},
		
		/**
		 * Binds the view to the object path.
		 *
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(){
			var oView = this.getView();
			if(this.sObjectPath === "/createEntry") {
				oView.bindElement(this.sObjectPath);
			} else {
				oView.bindElement("/adressen" + this.sObjectPath);
			}
		}
	});	
});