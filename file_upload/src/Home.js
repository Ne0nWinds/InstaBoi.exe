import React from 'react';
import './App.css';
import './Home.css';
import axios from 'axios';

class Home extends React.Component {

	state = {
		allUsers: [],
		this_user: "",
	}

	componentDidMount() {
		axios.get('/photos/1')
		.then(res => {
			if (!res.data.msg) {
				console.log(res.data);
				this.setState({ allUsers: res.data.users, this_user: res.data.this_user});
			}
		})
	}

	likePhoto(e) {
		e.persist();
		console.log(e.target);
		axios.get('/like/' + e.target.id)
		.then(res => {
			let currentText = document.getElementById("p" + e.target.id).innerText.split(" ");
			let currentLikes = currentText[0] * 1;
			if (res.data.liked === true) {
				e.target.classList.remove('not_liked');
				e.target.classList.add('liked');
				currentLikes++;
			} else if (res.data.liked === false) {
				e.target.classList.add('not_liked');
				e.target.classList.remove('liked');
				currentLikes--;
			}
			document.getElementById("p" + e.target.id).innerText = currentLikes + " Like" + ((currentLikes == 1) ? "" : "s")
		})
	}

	render() {
		return <div className="home">
			{this.state.allUsers.map(u => {
				if (u.Photos[0] != undefined) {
				let liked = (u.Photos[0].Likes.find((i) => i == this.state.this_user) != undefined);
				return <div className="post">
					<h2>{u.Username}</h2>
					<img src={'data:' + u.Photos[0].Type + ';base64,' + u.Photos[0].Data.toString('base64')} />
					<div className="likes">
						<div 
							id={u._id + "/" + u.Photos[0]._id} 
							className={(liked) ? "heart entypo-heart liked" : "heart entypo-heart not_liked"} 
							onClick={this.likePhoto}>
						</div>
						<p id={"p" + u._id + "/" + u.Photos[0]._id}>{u.Photos[0].Likes.length} Like{(u.Photos[0].Likes.length === 1) ? "" : "s"}</p>
					</div>
					</div>
				}
			})}
		</div>
	}

}

export default Home;
