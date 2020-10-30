
document.addEventListener('DOMContentLoaded', function() {
  onLoad();
});

function onLoad(){

  var path = window.location.href;
  var id = null;

  
  

  
  var loadSection = 1;
 
  
  if( (path.split('#')[1] != null) && path.split('#')[1].length > 1){
    path = window.location.href.split('#')[1];
    var pageNum = path.split('=')[1];
    
    var currentPage = path;
    if(currentPage.includes('/') && typeof currentPage.split('/')[2] !== 'undefined'){
      page = currentPage.split('/')[1];
      id = currentPage.split('?')[0];
      id = id.split('/')[2]

    }else if(currentPage.includes('?')){
      page = currentPage.split('?')[0];
      page = page.split('/')[1];
      pageNum = currentPage.split('=')[1];
    }

    if(pageNum == parseInt(pageNum, 10)){

      loadSection = pageNum;
      
    }
    if(page == ""){
      page = "all_posts"
    }
    
    loadPage(page, id, loadSection);


    



  }
  else{
    loadPage('all_posts', null, null)
    
  }

  document.querySelectorAll('.nav-link').forEach( link => {
    link.onclick = function() {
      const page = link.dataset.link;
      loadPage(page);
      

        // Add the current state to the history

    };
  });

}

function setupPostClick(){
  document.querySelectorAll('.user').forEach( userPost => {
    userPost.onclick = function(){
      //basically redirect to user page and push history
      const id = userPost.dataset.id;
      const page = 'user';
      const section = 1;

      history.pushState({page: page, id:id, section:section}, "", `#/${page}/${id}?page=${section}`)
      userPage(id, section);

    }
  })
  document.querySelectorAll('.like').forEach( userPost => {
    userPost.onclick = async function(){
      //we need the like in the page to update and to update the database.
      const id = userPost.dataset.id;
      var post = document.querySelector(`#like_${id}`)


      var likes = parseInt(post.dataset.likes)+1;
      post.setAttribute('data-likes', likes);
      
      console.log(`unliking post: ${id} new likes are: ${userPost.dataset.likes}`)
      user_id = await getUserId()
      likePost(id, user_id, likes);


    }
  })
  document.querySelectorAll('.unlike').forEach( userPost => {
    userPost.onclick = async function(){
      //we need the like in the page to update and to update the database.
      const id = userPost.dataset.id;
      var post = document.querySelector(`#like_${id}`)

      var likes = parseInt(post.dataset.likes)-1;
      post.setAttribute('data-likes', likes);
      console.log(`unliking post: ${id} new likes are: ${userPost.dataset.likes}`)
      
      user_id = await getUserId()
      unlikePost(id, user_id, likes);



    }
  })

  //bad practice - but I need to move on to learning React.
  document.querySelectorAll('#submit_chirp').forEach( submit => {
    submit.onclick = async function(){
      //we need the like in the page to update and to update the database.
      var text = document.getElementById('input_text').value;
      console.log(`our inputed text was: ${text}`)
      var user_id = await getUserId();
      postResponse = await createPost(user_id, text);
      document.getElementById('input_text').value = '';

      //okay now lets just call 
      onLoad();






    }
  })

  document.querySelectorAll('#edit').forEach( edit => {
    edit.onclick = async function(){
      const post_id = edit.dataset.postid;

      editPost(post_id);
      


    }
  })


}

async function editPost(post_id){
  clearAll()



  var text = await getPostText(post_id)

  console.log(`the text recieved was ${text}`)
  document.querySelector('#create_post').style.display = 'block'



  //then set the "submit post" html up with no posts, and the inner value to be equal to the current one
  document.querySelector('#create_post').innerHTML = `<h5>Editing post:</h5><input type="text" id="input_text" value="${text}"></input>
  <br><br>
  <input id="submit_edit" type="button" value="Submit Edit!">`;

  user_id = await getUserId();

  document.getElementById('submit_edit').onclick = function() {
    submitEdit(post_id, document.getElementById('input_text').value, user_id);
    loadPage('all_posts', null, null);


  };






}

async function getPostText(post_id){

  const url = `api/get_post_text/${post_id}`
  
  const response = await fetch(url);
  const body = await response.json();
  
  return body['text'];

}

async function submitEdit(post_id, text, user_id){

  const url = "api/edit_post"
  
  const response = await fetch(url, { method: "POST",
    body: JSON.stringify({
      id: `${post_id}`,
      text: `${text}`,
      user: `${user_id}`
    })}
  );
  const body = await response.json()
  
  return body;



}

async function createPost(user_id, text){

  const url = `api/create_post`
  
  const response = await fetch(url, { method: "POST",
    body: JSON.stringify({
      user_id: `${user_id}`,
      text: `${text}`
    })}
  );
  const body = await response.json()
  
  return body;

}

async function likePost(post_id, user_id, likes){

  //TODO communicate click to backend and check that the likes are the same.
  //if they are not - update the like correctly.


  document.querySelector(`#like_${post_id}`).innerHTML = `Likes: ${likes}`;
  document.querySelector(`#like_cont_${post_id}`).innerHTML = `<input class="unlike" type="button" data-id=${post_id} value="Un-Like"></input>`;

  const url = `api/like_post/${post_id}/${user_id}`
  
  const response = await fetch(url, { method: "POST",
    body: JSON.stringify({
      action: 'like'
    })

  })
  const body = await response.json()
  
  if(body['like'] == "like"){
    console.log(`backend was successfully liked`)
  }else{
    console.log(`there was an error liking the bacend`)

  }

  setupPostClick()
  //that is a very inefficient method - but at least it reduces code - using react would be better.

}edit

async function unlikePost(post_id, user_id,  likes){

    //TODO communicate click to backend and check that the likes are the same.
  //if they are not - update the like correctly.

  document.querySelector(`#like_${post_id}`).innerHTML = `Likes: ${likes}`;
  document.querySelector(`#like_cont_${post_id}`).innerHTML = `<input class="like" type="button" data-id=${post_id} value="Like"></input>`;

  const url = `api/like_post/${post_id}/${user_id}`
  
  const response = await fetch(url, { method: "POST",
    body: JSON.stringify({
      action: 'unlike'
    })

  })
  const body = await response.json()
  
  

  setupPostClick()
  //that is a very inefficient method - but at least it reduces code - using react would be better.
}




async function loadPage(page, id, section){
  if( page == null){
    page = "all_posts";
  }

  if(id == null && section == null){
    section = 1;
    if( page == "all_posts"){
      history.pushState({page: page, section:section}, "", `#/${page}?page=${section}`)
      allPosts(section);
    }
    else if(page == "user"){
      //need to figure out how to handle the history push



      id = await getUserId()
      
      
      history.pushState({page: page, id:id, section:section}, "", `#/${page}/${id}?page=${section}`)
      userPage(section,id);
    }else if(page == "following"){
      
        id = await getUserId()
        
      
        history.pushState({page: page, id:id, section:section}, "", `#/${page}/${id}?page=${section}`)
        followingPosts(section,id);

      

    }
    else{
      history.pushState({page: page, section:section}, "", `#/${page}?page=${section}`)
      allPosts(section)
    }
  }
  else{
    if(page == "user"){
      //need to figure out how to handle the history push


      history.pushState({page: page, id:id, section:section}, "", `#/${page}/${id}?page=${section}`)
      
      
      userPage(id, section);

    }else if(page == "following"){
      
  
      history.pushState({page: page, id:id, section:section}, "", `#/${page}/${id}?page=${section}`)
      followingPosts(section,id);
    }
    else{
      history.pushState({page: page, section:section}, "", `#/${page}?page=${section}`)

      allPosts(section)
    }

  }

}



window.onpopstate = function(event) {
  loadPage(event.state.page, event.state.id, event.state.section);
}

function clearAll(){
  document.querySelector('#user_page').style.display = 'none'
  document.querySelector('#all_posts').style.display = 'none'
  document.querySelector('#create_post').style.display = 'none'

  document.querySelector('#following_posts').style.display = 'none'

}


function showSection(page) {
  clearAll();

}

function postHTML(posts){

  var lenPosts = Object.keys(posts).length;

  var results =`<ul id="posts">`;
  var signedIn;

  if( posts[0][2] == null){
    signedIn = false;

  }
  else{
    signedIn = true;
    user_id = posts[0][5]
  }

  
  for(i=1; i<lenPosts; i++){
    var user = posts[i][0];
    var text = posts[i][1];
    var likes = posts[i][2];
    var date = posts[i][3];
    var id = posts[i][4];
    var hasLiked = posts[i][5];
    var postId = posts[i][6];
    //need new variable: hasLiked
    //TODO: setup a like and unlike button here.
    var post = `<li class="page-item"><h5 class="user" data-id=${id}>${user}</h5><h6 class="post_text" onclick> ${text}</h6><small class="likes" id="like_${postId}" data-likes=${likes}> Likes: ${likes}</small> <Br><small class="date">   Created:${date}</small>`;
    
    console.log( `for post ${postId}, the state of hasLiked is ${hasLiked}`)
    if(signedIn){


      if(hasLiked == true){
        //add unlike button
        var unlikeButton = `<br><div class="like_container" id="like_cont_${postId}"> <input class="unlike" type="button" data-id="${postId}" value="Un-Like"></input></div>`
        post = post + unlikeButton;
      }
      else{
        //add like button
        var likeButton = `<br><div class="like_container" id="like_cont_${postId}"> <input class="like" type="button" data-id="${postId}" value="Like"></input></div>`
        post = post + likeButton;
      }

      if(id == user_id ){
        var editButton = ` <input id="edit" type="button" data-postid="${postId}" value="Edit Post"></input></li>`
        post = post + editButton;
      }

      end = `</li>`;
      post = post + end;

 

      //now lets add an edit button if the user of the post is the same as the current user.
    }

    results= results + post ;

  }
  var hasNextPage = posts[0][0];
  var hasPrevious = posts[0][1];

  var wrap = `</ul>`;
  results = results + wrap;
  
  if(hasPrevious === true && hasNextPage === true){
    //add a next page button
    var prevButton = `<input class="prev" type="button" value="Previous Page"></input>`;
    results = results + prevButton;
    var nextButton = `<input class="next" type="button" value="Next Page"></input>`;
    results = results + nextButton;

  }else if(hasPrevious === true){
    var prevButton = `<input class="prev" type="button" value="Previous Page"></input>`;
    results = results + prevButton;
  }
  else if (hasNextPage === true){
    //add a previous page button
    var nextButton = `<input class="next" type="button" value="Next Page"></input>`;
    results = results + nextButton;

  }
  return results;


}



function setupNextPageClick(page, section, id){
  section = parseInt(section);
  if(page == "all_posts"){


    document.querySelectorAll('.next').forEach( nextButton => {
      nextButton.onclick = function(){
        section = section + 1;
        history.pushState({page: page, section:section}, "", `#/${page}?page=${section}`)
        allPosts(section);

      }
    })

    document.querySelectorAll('.prev').forEach( prev => {
      prev.onclick = function(){
        section = section - 1;

        history.pushState({page: page, section:section}, "", `#/${page}?page=${section}`)
        allPosts(section);

      }
    })

  }else if (page == "following"){
    document.querySelectorAll('.next').forEach( nextButton => {
      nextButton.onclick = function(){
        section = section + 1;

        history.pushState({page: page, id:id, section:section}, "", `#/${page}/${id}?page=${section}`)
        followingPosts(section,id);
  
      }
    })

    document.querySelectorAll('.prev').forEach( prev => {
      prev.onclick = function(){
        section = section - 1;

        history.pushState({page: page, id:id, section:section}, "", `#/${page}/${id}?page=${section}`)
        followingPosts(section,id);

      }
    })
  }else if (page == "user"){
    document.querySelectorAll('.next').forEach( nextButton => {
      nextButton.onclick = function(){
        section = section + 1;

        history.pushState({page: page, id:id, section:section}, "", `#/${page}/${id}?page=${section}`)
        userPage(section,id);
    
      }
    })

    document.querySelectorAll('.prev').forEach( prev => {
      prev.onclick = function(){
        section = section - 1;

        history.pushState({page: page, id:id, section:section}, "", `#/${page}/${id}?page=${section}`)
        userPage(section,id);
  
      }
    })
  }

}

async function userPage(id, section){
  clearAll();

  //get how mamy follows - and how many following


  document.querySelector('#all_posts').style.display = 'block';
  document.querySelector('#user_page').style.display = 'block';


  var posts = await getUserPosts(id, section);
  const user = posts[0][2];
  const following = posts[0][3];
  const followed = posts[0][4];
  
  var signedIn;
  var currentUser = await getUserId();
  var user_followed;
 

  if( posts[0][2] == null || currentUser == id){
    //TODO find out if the current user is following
    signedIn = false;

  }
  else{
    signedIn = true;
    //check if the user is following the other user
    //need to create new api
    user_followed = await getIfFollowed(currentUser, id); //need to call api function to get true or false.

  }
 
  
  
  var userHTML = `<div id='user_section'><h2 id='user_header'>${user}</h2> <br> <h6 id="followers"> Number of Followers: ${following}</h6> <h6 id="following"> Following this many Users: ${followed}</h6></div>` ;


  if(signedIn == true && user_followed == false ){
    const followButton = `<div id="follow_cont"><input id="follow" type="button" data-loggedInUserId="${currentUser}" data-tofollowuserid="${id}" value="follow"></input></div>`;
    userHTML = userHTML + followButton;
  }
  else if (signedIn == true && user_followed == true){
    const unfollowButton = `<div id="follow_cont"><input id="unfollow" type="button" value="unfollow" data-loggedinuserid="${currentUser}" data-toFollowUserId="${id}"></input></div>`;
    userHTML = userHTML + unfollowButton;
  }
  
  document.querySelector('#user_page').innerHTML = userHTML;
  var results = postHTML(posts);

  

  document.querySelector('#all_posts').innerHTML = results;
  //get all posts and display from paginator



  setupNextPageClick('user', section, id);
  setupPostClick();
  setupUserFollowBotton();

};

async function setupUserFollowBotton(){

  document.querySelectorAll('#follow').forEach( followButton => {
    followButton.onclick = async function(){

      //we need the like in the page to update and to update the database.
      const loggedInUserid = followButton.dataset.loggedinuserid;
      const toFollowUserId = followButton.dataset.tofollowuserid;

      await followUser(loggedInUserid, toFollowUserId, true);


      //TODO change the button to unfollow
      document.querySelector('#follow_cont').innerHTML = `<input id="unfollow" type="button" value="unfollow" data-loggedinuserid="${loggedInUserid}" data-toFollowUserId="${toFollowUserId}"></input>`;
      

      setupUserFollowBotton();
      

    }
  })

  document.querySelectorAll('#unfollow').forEach( followButton => {
    followButton.onclick = async function(){
   
      //we need the like in the page to update and to update the database.
      const loggedInUserid = followButton.dataset.loggedinuserid;
      const toFollowUserId = followButton.dataset.tofollowuserid;

      await followUser(loggedInUserid, toFollowUserId, false);
      //TODO change the button to follow

      document.querySelector('#follow_cont').innerHTML = `<input id="follow" type="button" value="follow" data-loggedinuserid="${loggedInUserid}" data-toFollowUserId="${toFollowUserId}"></input>`;
      
      setupUserFollowBotton();
    }
  })


};

async function getIfFollowed(user_id, following_id){
  const url = `api/follow/${user_id}/${following_id}`
  
  const response = await fetch(url)
  const body = await response.json()

  console.log(`Our getIfFOllowed response: ${body['status']}`)

  if(body['status'] == 'True'){
    return true;
  }else{
    return false;
  }
  


}

async function followUser(user_id, following_id, follow){
  //follow needs to be true or false (true to follow, false unfollow)
  const url = `api/follow/${user_id}/${following_id}`
  
  const response = await fetch(url, { method: "POST",
    body: JSON.stringify({
      action: `${follow}`
    })}
  );
  const body = await response.json()
  
  return body;

}


async function getUserPosts(id,section){
  const url = `api/user/${id}?page=${section}`
  
  const response = await fetch(url)
  const body = await response.json()
  
  return body;

}

async function followingPosts(section, id){
  clearAll();


  document.querySelector('#following_posts').style.display = 'block'
  document.querySelector('#all_posts').style.display = 'block'

  var posts = await getFollowingPosts(id, section);

  var results = postHTML(posts);
  

  document.querySelector('#all_posts').innerHTML = results;
  document.querySelector('#following_posts').innerHTML = `Following Posts:`
  //get all posts and display from paginator

  setupNextPageClick('following', section, id);
  setupPostClick();
}



async function getFollowingPosts(id,section){
  const url = `api/following/${id}?page=${section}`
  
  const response = await fetch(url)
  const body = await response.json()
  
  return body;

}



async function getUserId(){
  var userid;

  const response = await fetch('api/user')
  const body = await response.json()
  userid = body['id']

  return userid;
}

async function getAllPosts(section){
  const url = `api/all_posts?page=${section}`
  
  const response = await fetch(url)
  const body = await response.json()
  
  return body;
}

async function allPosts(section){

  clearAll();
  document.querySelector('#create_post').style.display = 'block'
  document.querySelector('#all_posts').style.display = 'block'

  var posts = await getAllPosts(section);


  document.querySelector('#create_post').innerHTML = `<h5>Create a new Post!</h5><input type="text" id="input_text">
    <br><br>
    <input id="submit_chirp" type="button" value="Submit Chirp!">`;

  var results = postHTML(posts);
  

  document.querySelector('#all_posts').innerHTML = results;
  //get all posts and display from paginator
  
  setupNextPageClick('all_posts', section, null);
  setupPostClick();


}