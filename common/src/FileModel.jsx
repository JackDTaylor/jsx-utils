import JsxUtilsModule from "../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	*dependencies() {
		yield "file-saver";
	}

	import() {
		const saveAs = this.dependency("file-saver");

		const base64ToArrayBuffer = function(base64) {
			const binary = window.atob(base64);
			const len = binary.length;
			const bytes = new Uint8Array(len);

			for(let i = 0; i < len; i++) {
				bytes[i] = binary.charCodeAt(i);
			}

			return bytes;
		};

		global.FileModel = class FileModel {
			name;
			buffer;

			constructor(filename, contents) {
				this.name = filename;
				this.contents = contents;
			}

			get size() {
				return this.buffer.byteLength;
			}

			get extension() {
				return this.filename.split('.').last;
			}

			get basename() {
				return this.filename.split('.').slice(0, -1).join('.');
			}

			set extension(value) {
				this.filename = value ? `${this.basename}.${value}` : this.basename;
			}

			set basename(value) {
				this.filename = `${value}.${this.extension}`;
			}

			asBlob() {
				return new Blob([this.buffer]);
			}

			asBytes() {
				return new Uint8Array(this.buffer);
			}

			asBase64() {
				const bytes = this.asBytes();
				const len = bytes.byteLength;

				let binary = '';

				for(let i = 0; i < len; i++) {
					binary += String.fromCharCode(bytes[i]);
				}

				return btoa(binary);
			}

			set contents(value) {
				if(value === null) {
					this.buffer = null;
					return;
				}

				if(value instanceof Uint8Array) {
					this.buffer = value.buffer;
					return;
				}

				if(value instanceof ArrayBuffer) {
					this.buffer = value;
					return;
				}

				console.error(value);
				throw new Error('Unknown FileModel contents type');
			}

			@frontendOnly download() {
				return saveAs(this.asBlob(), this.name);
			}

			toJSON() {
				return {
					$class: this.constructor.name,
					name: this.name,
					data: this.asBase64()
				};
			}

			static fromJSON(data) {
				return new FileModel(data.name, base64ToArrayBuffer(data.data));
			}
		};
	}
}