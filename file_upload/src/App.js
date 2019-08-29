import React from 'react';
import './App.css';
import { Link, Switch, Route, BrowserRouter } from 'react-router-dom';
import ImageUpload from './ImageUpload.js';
import Login_Reg from './Login_Reg.js';
import Profile from './Profile.js';
import Home from './Home.js';

const NavBar = () =>
	<nav>
		<ul>
			<li><Link to='/'>Home</Link></li>
			<li><Link to='/upload'>Upload Image</Link></li>
			<li><Link to='/profile'>Profile</Link></li>
		</ul>
	</nav>

const Main = () =>
	<main>
		<Switch>
			<Route exact path="/profile" component={Profile} />
			<Route exact path="/Upload" component={ImageUpload} />
			<Route exact path="/Login" component={Login_Reg} />
			<Route exact path="/" component={Home} />
		</Switch>
	</main>

class App extends React.Component {

	render() {
		return <BrowserRouter>
				<NavBar />
				<Main />
			</BrowserRouter>
	}
}

export default App;
