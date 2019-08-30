import React from 'react';
import { Redirect } from 'react-router-dom';
import './App.css';
import axios from 'axios';

class Logout extends React.Component {
	componentDidMount() {
		axios.get('/logout')
	}
	render() {
		return <Redirect to='/login' />
	}
}

export default Logout;
