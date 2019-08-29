import React from 'react';
import './App.css';
import axios from 'axios';

class ImageUpload extends React.Component {

	state = {
		selectedFile: null,
		hasAdvancedUpload: false,
	}

	fileSelectedHandler = event => {
		this.setState({
			selectedFile: event.target.files[0]
		});
	}
	dropSelectedHandler = event => {
		console.log(event);
		event.preventDefault();
		event.stopPropagation();
		this.setState({
			selectedFile: event.dataTransfer.files[0]
		});
		console.log(this.state.selectedFile);
	}
	preventDefaults = event => {
		event.preventDefault();
		event.stopPropagation();
	}

	componentDidMount() {
		let isAdvancedUpload = function() {
			var div = document.createElement('div');
			return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
		}();
		this.setState({
			hasAdvancedUpload: isAdvancedUpload
		});
	}

	fileUploadHandler = () => {
		const fd = new FormData();
		fd.append('image', this.state.selectedFile,)
		axios.post('/upload', fd,{
			onUploadProgress: progressEvent => {
				console.log("Upload Progress: " + (progressEvent.loaded / progressEvent.total) * 100);
			}
		}).then(res => console.log(res));
	}

	render() {
		return (
	  	<div className="App" >
			<div className={this.state.hasAdvancedUpload ? 'hasAdvancedUpload' : ''} onDrop={this.dropSelectedHandler} onDragEnter={this.preventDefaults} onDragOver={this.preventDefaults} onDragLeave={this.preventDefaults}>
			<input type="file" className="" onChange={this.fileSelectedHandler} accept="image/jpeg,image/png" />
			<p>{(this.state.selectedFile != null) ? this.state.selectedFile.name : "No selected file"}</p>
			<button onClick={this.fileUploadHandler}>Upload</button>
			</div>
	  	</div>
		);
	}
}

export default ImageUpload;
