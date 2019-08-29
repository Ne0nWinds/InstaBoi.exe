import React from 'react';
import { Redirect } from 'react-router-dom';
import './App.css';
import axios from 'axios';

const Login = () => 
<div>
	<input type="password" placeholder="Password" />
</div>

class Register extends React.Component {

	render() {
		return <div>
			{(/.*@.*/.test(this.props.credentials)) ?
			<input type="text" placeholder="Username" /> :
			<input type="text" placeholder="Email" />}
			<input type="password" placeholder="Password" />
		</div>
	}
}

class Login_Reg extends React.Component {

	state = {
		credentials: '',
		userExists: null,
		userLoggedIn: false,
		users: [],
		lastQuery: "",
	}

	handleLoginInfo = event => {
		event.persist();


		function checkUsers(dis) {
			let userExists = false;
			let i = 0; let len = dis.state.users.length;
			for (;i<len;i++) {
				if (dis.state.users[i].Username == event.target.value || dis.state.users[i].Email == event.target.value) {
					console.log("AAAA");
					userExists = true; break;
				}
			}
			dis.setState({
				userExists: userExists
			})
		}
		checkUsers(this);

		console.log(this.state.users);

		if (event.target.value.length > 5) {
			console.log(this.state.lastQuery);
			let lastQuery = new RegExp('^' + this.state.lastQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
			if (!lastQuery.test(event.target.value) || this.state.lastQuery == "") {
				this.setState({
					lastQuery: event.target.value,
				});
				axios.post('/searchUsers',{
					"Login": event.target.value
				})
				.then(res => {
					this.setState({
						users: res.data.users
					});
					checkUsers(this);
				})
			}
		} else 
			this.setState({ userExists: null });

		this.setState({
			credentials: event.target.value
		});
	}

	handleRegistration = event => {
		event.persist();
		event.preventDefault();

		if (event.target[1] != undefined) {
		let userInfo = {};
		userInfo.Email = (/.*@.*/.test(this.state.credentials)) ? event.target[0].value : event.target[1].value;
		userInfo.Username = (/.*@.*/.test(this.state.credentials)) ? event.target[1].value : event.target[0].value;
		userInfo.Password = event.target[2].value;
		axios.post('/register', userInfo)
		.then(res => {
			if (res.data.msg === "Account Created Successfully") {
				global.userLoggedIn = true;
				this.setState({ userLoggedIn: true });
			}
		});
		} else {
			clearTimeout(this.timeout);
			if (event.target[0].value != "") {
				axios.post('/findUser',{
					"Login": event.target[0].value
				})
				.then(res => {
					this.setState({
						userExists: res.data.userExists
					});
				})
			} else {
				this.setState({ userExists: null});
			}
		}
	}
	handleLogin = event => {
		event.preventDefault();
		console.log("Logging In");
		let userInfo = {};

			userInfo.Login = event.target[0].value;
			userInfo.Password = event.target[1].value;
			axios.post('/login', userInfo)
			.then(res => {
				if (res.data.msg === "Login Successful") {
					global.userLoggedIn = true;
					this.setState({ userLoggedIn: true })
				}
			});
	}

	render() {
		if (this.state.userLoggedIn === false) {
		return <div>
				<h1>{(this.state.userExists === null) ?  "Sign Up Or Login" :
					(this.state.userExists) ? "Login" : "Sign Up"}</h1>
				<form onSubmit={(this.state.userExists) ? this.handleLogin : this.handleRegistration}>
					<input type="text" placeholder="Email / Username" onChange={this.handleLoginInfo} value={this.state.credentials} />
					{(this.state.userExists !== null) ? 
						(this.state.userExists === true) ?
							<Login /> : <Register credentials={this.state.credentials} />
					: ""}
					{(this.state.userExists !== null) ? 
					  <button>Submit</button> : ""}
				</form>
			</div>
		} else {
			return <Redirect to='/' />
		}
	}
}

export default Login_Reg;
