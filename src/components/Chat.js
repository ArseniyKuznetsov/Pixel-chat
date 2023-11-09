import { useContext, useState } from "react";
// data
import { Context } from '../index';
// firebase
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/compat/app';
// css
import '../styles/components/chat.scss';
// components
import Loader from "./Loader";
import Message from "./Message";
import Button from './Button';
import User from './User';
// icons
import sendBtnIcon from '../../src/images/send-btn.svg';
import exitArrowIcon from '../../src/images/exit-arrow.svg';

const Chat = () => {
  const {auth, firestore} = useContext(Context)
  const [user] = useAuthState(auth)
  const [value, setValue] = useState('')
  const [chatUsers] = useCollectionData(
    firestore.collection('users')
  )
  const [messages, loading] = useCollectionData(
    firestore.collection('messages').orderBy('createdAt')
  )

  const sendMessage = async () => {
    let dataToSend = {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      text: value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }
    firestore.collection('messages').add(dataToSend)

    firestore.collection('users').doc(`user-${user.uid}`).get().then((doc) => {
      if (!doc.exists) firestore.collection('users').doc(`user-${user.uid}`).set(dataToSend);
    })

    setValue('')
  }

  const signOut = () => {
    auth.signOut()
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="chat-container">
      <div className="chat">
        <div className="chat__content">
          <div className="chat__content-top">
            <div className="chat__messages">
              <div className="chat__messages-inner">
                {messages.length ? (
                  <div className="chat__messages-container">
                    {messages.map((message, index) => {
                      return <Message key={`message-${index}`} message={message} user={user} />
                    })}
                  </div>
                ) : (
                  <div className="chat__empty">Сообщения отсутствуют</div>
                )}
              </div>
            </div>
          </div>
          <div className="chat__nav">
            <div className="chat__nav-inner">
              <textarea placeholder="Твоё сообщение..." value={value} onChange={e => setValue(e.target.value)} />
              <Button onClick={sendMessage} icon={sendBtnIcon} />
            </div>
          </div>
        </div>
        <div className="chat__list">
          <div className="chat__list-inner">
            <div className="chat__list-title">Участники чата</div>
            <div className="chat__list-content">
              {chatUsers.map((chatUser, index) => {
                return <User key={`user-${index}`} user={chatUser} />
              })}
            </div>
            <div className="chat__out">
              <button onClick={signOut}>
                <span>Покинуть чат</span>
                <img src={exitArrowIcon} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
