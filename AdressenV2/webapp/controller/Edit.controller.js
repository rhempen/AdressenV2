sap.ui.define([
	"OpenUI5/AdressenV2/controller/BaseController",
	"OpenUI5/AdressenV2/util/FileSaver",
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

		onBildChange: function (oEvent) {
			// var sResponse = oEvent.getParameter("response");
			// var sResp = sResponse.replace(/<h1>/, "").replace(/<\/h1>/, "");
			// sap.m.MessageToast.show("Return Code: " + sResp);
			// var oSource = oEvent.getSource();
			// var f = oSource.oFileUpload.files[0];
			// var path = URL.createObjectURL(f);
			// path = path.replace(/blob:/, "");
			// var img = this.getView().byId("img");
			// img.setSrc = path;
			// var up = this.getView().byId("bildUpload");
			// up.setUploadUrl(path);
		},

		onUploadChange: function (oEvent) {
			var sFile = this.getView().byId("bildUpload").oFileUpload.files[0];
			var btnUpload = this.getView().byId("btnUpload");
			if (sFile) btnUpload.setVisible(true);
		},

		onBtnUpload: function (oEvent) {
			var that = this;
			var sFile = this.getView().byId("bildUpload").oFileUpload.files[0];
			var img = this.getView().byId("bildInput");
			var reader = new FileReader();
			reader.onload = function (e) {
				img.setSrc(reader.result);
				that.getView().byId("bildUpload").setValue("");
				that.getView().byId("btnUpload").setVisible(false);
			};
			reader.readAsDataURL(sFile);
		},

		onSave: function (oEvent) {
			var that = this; 
			var oModel = this.getModel();
			var oAdressen = oModel.getProperty("/adressen");
			var sCreate = this.getModel("viewModel").getProperty("/createMode");
			var sPath = this.getView().getBindingContext().getPath();
			var oRow = {},
				sId, sField, lFieldname;
			var aFields = this.getView().byId("form").getContent();

			// oRow.addrid = this.getView().getBindingContext().getPath().split("/").pop();
			oRow.addrid = this.sNextAddrid;
			oRow.name = "";
			oRow.firstletter = "";
			oRow.adresse = "";
			oRow.plz_ort = "";
			oRow.bild = "";
			oRow.emailg1 = "";
			oRow.emailp1 = "";
			oRow.geburtstag = "";
			oRow.geschlecht = "";
			oRow.notizen = "";
			oRow.ort = "";
			oRow.websiteg1 = "";
			oRow.websitep1 = "";

			aFields.forEach(function (field, index) {
				sId = field.getId().split("--")[1];
				if (sId && sId.match(/Input/)) {
					sField = sId.replace(/Input/, "").trim();
					if (sField === "name") {
						oRow.firstletter = field.getValue().substr(0, 1);
					}
					if (sField === "plz_ort") {
						oRow.ort = field.getValue().split(" ")[1] ? field.getValue().split(" ")[1] : "";
					}

					if (sCreate) {
						lFieldname = sField;
						if (sField === "bild") {
							oRow[lFieldname] = field.getProperty("src");
						} else {
							oRow[lFieldname] = field.getValue();
						}
					} else {
						if (sField === "name") {
							oModel.setProperty(sPath + "/firstletter", oRow.firstletter);
						}
						if (sField === "plz_ort") {
							oModel.setProperty(sPath + "/ort", oRow.ort);
						}
						if (sField === "bild") {
							var Bilddaten = field.getProperty("src");
							var Image = that._convBase64ToImage(Bilddaten);
							oModel.setProperty(sPath + "/" + sField, Bilddaten);
						} else {
							oModel.setProperty(sPath + "/" + sField, field.getValue());
						}
					}
				}
			});

			if (sCreate) {
				oAdressen.push(oRow);
				oModel.setProperty("/adressen", oAdressen);
			}

			var opt = {
				// bAppend: sCreate ? true : false,
				// bUpdate: sCreate ? false : true
				bUpdate: true
			};
			this.fillAddressDB(opt);

			this.getRouter().navTo("master");
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
		},
		
		/**
		 * @param base64Data incl. contentType 
		 * @see https://ourcodeworld.com/articles/read/322/how-to-convert-a-base64-image-into-a-image-file-and-upload-it-with-an-asynchronous-form-using-jquery
		 * @return the blob
		 */
		_convBase64ToImage: function (base64Data) {
			var that = this;
			var ImageURL = base64Data;
			// Split the base64 string in data and contentType
			var block = ImageURL.split(";");
			// Get the content type of the image
			var contentType = block[0].split(":")[1]; // In this case "image/jpg" or "image/png"
			// get the real base64 content of the file
			var realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."

			// Convert it to a blob to upload
			var blob = that._b64toBlob(realData, contentType);
			return blob;
		},

		/**
		 * Convert a base64 string in a Blob according to the data and contentType.
		 * 
		 * @param b64Data {String} Pure base64 string without contentType
		 * @param contentType {String} the content type of the file i.e (image/jpeg - image/png - text/plain)
		 * @param sliceSize {Int} SliceSize to process the byteCharacters
		 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
		 * @return Blob
		 */
		_b64toBlob: function (b64Data, contentType, sliceSize) {
			contentType = contentType || '';
			sliceSize = sliceSize || 512;

			var byteCharacters = atob(b64Data);
			var byteArrays = [];

			for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				var slice = byteCharacters.slice(offset, offset + sliceSize);

				var byteNumbers = new Array(slice.length);
				for (var i = 0; i < slice.length; i++) {
					byteNumbers[i] = slice.charCodeAt(i);
				}

				var byteArray = new Uint8Array(byteNumbers);

				byteArrays.push(byteArray);
			}

			var blob = new Blob(byteArrays, {
				type: contentType
			});
			return blob;
		}
	});
});