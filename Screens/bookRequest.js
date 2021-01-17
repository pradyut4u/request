import React from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput, TouchableOpacity } from 'react-native';
import firebase from 'firebase'
import db from '../config.js'
import MyHeader from '../Components/myHeader'

export default class BookRequest extends React.Component{
	constructor(){
		super()
		this.state={
			userId:firebase.auth().currentUser.email,
			bookName: '',
			reason: '',
			requestId:'',
			docId:'',
			bookStatus:'',
			bookrequestactive:'',
			userDoc:''
		}
	}
	uniqueId(){
		return(
			Math.random().toString(36).substring(7)
		)
	}
	addRequest = (bookName,reason) =>{
		var userId=this.state.userId
		var requestId=this.uniqueId()
		db.collection('requestedBook').add({
		userId:userId,bookName:bookName,reason:reason,requestId:requestId,bookStatus:"requested"})
		this.setState({
			bookName:'',
			reason:''
		})
		this.getBookRequest()
		db.collection("users").where("emailid","==",this.state.userId).get()
		.then(snapShot=>{
			snapShot.forEach(doc=>{
				db.collection("users").doc(doc.id).update({
					bookrequestactive:true
				})
			})
		})
		return(
			alert("Book requested Succesfully")
		)
	}

    getBookRequest = ()=>{
		db.collection('requestedBook').where("userId","==",this.state.userId).get()
		.then(snapShot=>{
			snapShot.forEach(doc=>{
				if(doc.data().bookStatus!=="recived"){
					this.setState({
						requestId:doc.data().requestId,
						bookStatus:doc.data().bookstatus,
						bookName:doc.data().bookName,
						docId:doc.id
					})
				}

			})
		})
	}

	bookrequestactive = ()=>{
		db.collection("users").where("emailid","==",this.state.userId).onSnapshot(snapShot=>{
			snapShot.forEach(doc=>{
				this.setState({
					bookrequestactive:doc.data().bookrequestactive,
					userDoc:doc.id
				})
			})
		})
	}

	updateBookRequestStaus = ()=>{
		db.collection("users").where("emailid","==",this.state.userId).onSnapshot(snapShot=>{
			snapShot.forEach(doc=>{
				db.collection("users").doc(doc.id).update({
					bookrequestactive:false
				})
			})
		})
		db.collection("requestedBook").doc(this.state.docId).update({
			bookStatus:"recived"
		})
	}

	sendNotification = ()=>{
		db.collection("users").where("emailid","==",this.state.userId).onSnapshot(snapShot=>{
			snapShot.forEach(doc=>{
				var name = doc.data().firstName+doc.data().lastName
				db.collection("allNotifications").where("reqestId","==",this.state.requestId).onSnapshot(snapShot=>{
					snapShot.forEach(doc=>{
						var donarId = doc.data().donarId
						var bookName = doc.data().bookName
					})
				})
			})
		})
	}

	componentDidMount(){
		this.bookrequestactive()
		this.getBookRequest()
	}

	render(){
		console.log(this.state.bookrequestactive)
		if(this.state.bookrequestactive === true){
			return(
				<View style={{flex:1, justifyContent:'center'}}>
					<View style={{borderColor:'cyan', borderWidth:10, justifyContent:'center', alignItems:'center', margin:10, padding:10}}>
						<Text>Book Name</Text>
						<Text>{this.state.bookName}</Text>
					</View>
					<View style={{borderColor:'cyan', borderWidth:10, justifyContent:'center', alignItems:'center', margin:10, padding:10}}>
						<Text>Book Status</Text>
						<Text>{this.state.bookStatus}</Text>
					</View>
					<TouchableOpacity style={{
						borderColor:'cyan', borderWidth:10, justifyContent:'center', alignItems:'center', margin:10, padding:10
						}}
						onPress={()=>{
							this.updateBookRequestStaus();
							this.sendNotification()
						}}>
						I recived the book
					</TouchableOpacity>
				</View>
			)
		}
		else{
		return(
			<View>
				<MyHeader title={"Request"} navigation={this.props.navigation}/>
			<KeyboardAvoidingView>
			<TextInput placeholder="Book name" onChangeText={text=>{this.setState({bookName:text})}} value={this.state.bookName}/>
			<TextInput placeholder="Reason" multiline numberOfLines={5} onChangeText={text=>{this.setState({reason:text})}} value={this.state.reason}/>
			<TouchableOpacity onPress={()=>{this.addRequest(this.state.bookName,this.state.reason)}}>
			<Text>Request</Text>
			</TouchableOpacity>
			</KeyboardAvoidingView>
			</View>
		)
		}
	}
}