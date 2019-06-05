sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"

], function (Controller, History) {
	"use strict";

	var model;
	var myDb = {};

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
			var bReplace = false;

			if (sRoute === "master") {
				this.getRouter().navTo(sRoute, mData, bReplace);
				// }
				// else if (sPreviousHash !== undefined && sPreviousHash !== "mock") {
				// 	// The history contains a previous entry
				// 	/*eslint-disable */
				// 	window.history.go(-1);
				// 	/*eslint-enable */
			} else {
				// Otherwise we go backwards with a forward history
				bReplace = true;
				this.getRouter().navTo(sRoute, mData, bReplace);
			}
		},

		myNavBackWithoutHash: function (sRoute, mData) {
			var bReplace = true;
			this.getRouter().navTo(sRoute, mData, bReplace);
		},

		loadInitialData: function (callback) {
			// var oModel = sap.ui.getCore().getModel();
			// Run with Mockdata or Not?
			// window.location.hash = "#mock";
			if (window.location.hash !== "#mock") {
				var opt = {};
				// opt.bGetAddressData = true;
				this.createAddressDB(opt);
				if (callback) { callback.apply(this, arguments); }
				// this.getMockData(callback);
				// Datenbeschaffung mittel PHP und SQL-DB
				// jQuery.ajax({
				// 	type: "GET",
				// 	contentType: "application/json",
				// 	url: "webapp/php/getData.php/all/",
				// 	dataType: "json",
				// 	success: function (data) {
				// 		oModel.setData(data);
				// 		sap.ui.getCore().setModel(oModel);
				// 	},
				// 	error: function (data, textStatus, jqXHR) {
				// 		sap.m.MessageToast.show("an error occurred retrievieng the Data! " + textStatus);
				// 	}
				// });
			} else {
				this.getMockData(callback);
			}
		},

		getMockData: function (callback) {
			var that = this;
			model = sap.ui.getCore().getModel();
			$.ajax({
				url: "webapp/model/adressen.json",
				dataType: "json",
				success: function (data) {
					model.setProperty("/adressen", data.adressen);
					model.setProperty("/msg", data.msg);
					sap.ui.getCore().setModel(model);
					var opt = { bFillAddressDB : true };
					that.initAddressDB(opt);
					if (callback) { callback.apply(that.arguments); }
				},
				error: function (data, textStatus, jqXHR) {
					sap.m.MessageToast.show("an error occurred retrievieng the Data! " + textStatus);
				}
			});
		},

		// Funktionen für IndexedDB
		createAddressDB: function (opt) {
			var that = this;
			if (!opt) { opt = {}; }
			//Nur erzeugen, wenn DB noch nicht im Model vorhanden
			model = sap.ui.getCore().getModel();
			if (model && model.myDB) {
				//wenn myDB schon erzeugt:
				//sicherstellen, dass DB zu diesem Zeitpunkt initialisiert wird
				this.initAddressDb();
				//sollen Adressen eingelesen werden?
				if (opt.bGetAddressdata) {
					this.readAddressDB();
				}
				//ausserdem immer CallBack-Funktion aufrufen
				if (opt.fCallBack)  {
					opt.fCallBack();
				}
				return;
			}
			if (window.indexedDB === null) {
				this.onDBErrors("Error_indexedDB");
			} else {
				var createDBRequest = indexedDB.open("AdressenDB", 1);

				createDBRequest.onupgradeneeded = function (event) {
					var db = event.target.result;
					//alte Version löschen, sofern bereits vorhanden
					if (db.objectStoreNames.contains("Adressen")) {
						db.deleteObjectStore("Adressen");
					}
					var objectStore = db.createObjectStore("Adressen", {
						keyPath: "addrid"
					});
					objectStore.createIndex("name", "name", {
						unique: false
					});
					objectStore.createIndex("ort", "ort", {
						unique: false
					});
				};
				createDBRequest.onsuccess = function (event) {
					model = sap.ui.getCore().getModel();
					model.myDB = event.target.result;
					// sicherstellen, dass DB zu diesem Zeitpunkt initialisiert wird
					that.readAddressDB();
				};
				createDBRequest.onerror = function (oError) {
					that.onDBErrors("Error_DBCreation");
				};
			}
		},

		initAddressDB: function (opt) {
			if (!opt) { opt = {}; }
			var that = this;
			var myDB;
			var request = indexedDB.open("AdressenDB", 1);
			request.onerror = function (evt) {
				//initialisieren nicht nötig bei leerer DB
			};
			request.onsuccess = function (evt) {
				myDB = request.result;
				if (myDB) {
					sap.ui.getCore().getModel().myDB = myDB;
					var oTransaction = myDB.transaction(["Adressen"], "readwrite");
					var oAdressen = oTransaction.objectStore("Adressen");
					var clearDBRequest = oAdressen.clear();
					clearDBRequest.onerror = function (oError) {
						that.onDBErrors("Error_DBClearing");
					};
					clearDBRequest.onsuccess = function (event) {
						if (opt.bFillAddressDB) {
							that.fillAddressDB();
						}
						if (opt.fCallBack) {
							opt.fCallBack();
						}
					};
				}
			};
		},

		readAddressDB: function () {
			var that = this;
			if (model && model.myDB) {
				var transaction = model.myDB.transaction(["Adressen"], "readwrite");
				transaction.oncomplete = function (oEvent) {
					// console.log("readAddressDB successful!");
				};

				transaction.onerror = function (oEvent) {
					that.onDBErrors("Error_DBReading");
				};

				var objectStore = transaction.objectStore("Adressen");
				objectStore.getAll().onsuccess = function (oEvent) {
					var oAdressen = oEvent.target.result;
					if (oAdressen.length > 0) {
						sap.ui.getCore().getModel().setProperty("/adressen", oAdressen);
					} else {
						that.getMockData(function (data) {
							that.fillAddressDB();
						});
					}
				};
			}
		},

		fillAddressDB: function (opt) {
			var that = this;
			if (!opt) { opt = {}; }
			if (!opt.bAppend) {
				opt.bAppend = false;
			}
			if (opt.bUpdate === undefined) {
				opt.bUpdate = opt.bAppend;
			}
			var myDB = sap.ui.getCore().getModel().myDB;

			that.bFirstDBError = false;

			if (opt.bAppend === false) {
				var oClearTransaction = myDB.transaction(["Adressen"], "readwrite");
				var oClearDataStore = oClearTransaction.objectStore("Adressen");

				var clearDBRequest = oClearDataStore.clear();
				clearDBRequest.onerror = function (oError) {
					that.onDBErrors("Error_DBClearing");
				};
			}

			var oFillTransaction = myDB.transaction(["Adressen"], "readwrite");
			var oFillDataStore = oFillTransaction.objectStore("Adressen");
			var oAdressen = sap.ui.getCore().getModel().getProperty("/adressen");
			for (var key in oAdressen) {
				if (oAdressen.hasOwnProperty(key)) {
					var oItm = oAdressen[key];
					if (opt.bUpdate === true) {
						oFillDataStore.put(oItm);
					} else {
						oFillDataStore.add(oItm);
					}
				}
			}
		},

		onDBErrors: function (sErrorName) {
			var sText = this.getText(sErrorName);
			sap.m.MessageBox.error(sText, {
				icon: "sap-icon://message-error",
				title: "Error",
				stretch: false
			});
		},

		/* Einen Text aus dem ResourceBundle holen */
		getText: function (iText) {
			var i18n = sap.ui.getCore().getModel("i18n");
			return i18n.getProperty(iText);
		}

	});
});