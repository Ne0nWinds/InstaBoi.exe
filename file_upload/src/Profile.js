import React from 'react';
import { Redirect } from 'react-router-dom';
import './App.css';
import axios from 'axios';

class Profile extends React.Component {

	state = {
		user: null,
		isLoggedIn: true
	}

	componentDidMount() {
		axios.get('/profile/')
			.then(response => {
				if (!response.data.msg) {
					this.setState({ user: response.data });
				} else {
					this.setState({ isLoggedIn: false})
				}
			});
	}

	render() {
		console.log(this.state.isLoggedIn);
		if (this.state.isLoggedIn === true) {
		return <div>
			{(this.state.user !== null) ?
				<h1>{this.state.user.Username}</h1> : ""}
			<hr />
			{(this.state.user !== null) ?
				this.state.user.Photos.map(p => {
					return <img alt="" src={'data:' + p.Type + ';base64,' + p.Data.toString('base64')} />
				}) : ""}
		</div>
		}
		else {
			return <Redirect to='/login' />
		}
	}
}

export default Profile;
