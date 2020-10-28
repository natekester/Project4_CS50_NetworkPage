
document.addEventListener('DOMContentLoaded', function() {

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
    console.log(`loading page with page: ${page}, id: ${id}, and section: ${loadSection}`)
    
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
});

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
    userPost.onclick = function(){
      //we need the like in the page to update and to update the database.
      const id = userPost.dataset.id;
      var post = document.querySelector(`#like_${id}`)
      console.log(` our parsed int is: ${parseInt(post.dataset.likes)}`)


      var likes = parseInt(post.dataset.likes)+1;
      post.setAttribute('data-likes', likes);
      
      console.log(`unliking post: ${id} new likes are: ${userPost.dataset.likes}`)
      
      likePost(id,likes);


    }
  })
  document.querySelectorAll('.unlike').forEach( userPost => {
    userPost.onclick = function(){
      //we need the like in the page to update and to update the database.
      const id = userPost.dataset.id;
      var post = document.querySelector(`#like_${id}`)
      console.log(` our parsed int is: ${parseInt(post.dataset.likes)}`)

      var likes = parseInt(post.dataset.likes)-1;
      post.setAttribute('data-likes', likes);
      console.log(`unliking post: ${id} new likes are: ${userPost.dataset.likes}`)
      
      unlikePost(id,likes);



    }
  })

}

async function likePost(id, likes){




  document.querySelector(`#like_${id}`).innerHTML = `Likes: ${likes}`;
  document.querySelector(`#like_cont_${id}`).innerHTML = `<input class="unlike" type="button" data-id=${id} value="Un-Like"></input>`;

  

  setupPostClick()
  //that is a very inefficient method - but at least it reduces code - using react would be better.
  return "liked"
}

async function unlikePost(id, likes){

  document.querySelector(`#like_${id}`).innerHTML = `Likes: ${likes}`;
  document.querySelector(`#like_cont_${id}`).innerHTML = `<input class="like" type="button" data-id=${id} value="Like"></input>`;

  setupPostClick()
  //that is a very inefficient method - but at least it reduces code - using react would be better.
  return "unliked"
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
    
    if(signedIn){
      if(hasLiked == true){
        //add unlike button
        var unlikeButton = `<br><div class="like_container" id="like_cont_${postId}"> <input class="unlike" type="button" data-id=${postId} value="Un-Like"></input></div></li>`
        post = post + unlikeButton;
      }
      else{
        //add like button
        var likeButton = `<br><div class="like_container" id="like_cont_${postId}"> <input class="like" type="button" data-id=${postId} value="Like"></input></div></li>`
        post = post + likeButton;
      }
    }

    results= results + post ;

  }
  var hasNextPage = posts[0][0];
  var hasPrevious = posts[0][1];

  var wrap = `</ul>`;
  results = results + wrap;

  if(hasPrevious === true){
    //add a next page button
    var prevButton = `<input class="prev" type="button" value="Previous Page"></input>`;
    results = results + prevButton;
  }else if (hasNextPage === true){
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
  
  //TODO include a follow button here
  const userHTML = `<div id='user_section'><h2 id='user_header'>${user}</h2> <br> <h6 id="followers"> Number of Followers: ${following}</h6> <h6 id="following"> Following this many Users: ${followed}</h6></div>` ;

  
  document.querySelector('#user_page').innerHTML = userHTML;
  var results = postHTML(posts);

  

  document.querySelector('#all_posts').innerHTML = results;
  //get all posts and display from paginator



  setupNextPageClick('user', section, id);
  setupPostClick();

};


async function getUserPosts(id,section){
  const url = `api/user/${id}?page=${section}`
  
  const response = await fetch(url)
  const body = await response.json()
  
  return body;

}

async function followingPosts(section, id){
  clearAll();

  document.querySelector('#all_posts').style.display = 'block'

  var posts = await getFollowingPosts(id, section);

  var results = postHTML(posts);
  

  document.querySelector('#all_posts').innerHTML = results;
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
  document.querySelector('#all_posts').style.display = 'block'

  var posts = await getAllPosts(section);

  var results = postHTML(posts);
  

  document.querySelector('#all_posts').innerHTML = results;
  //get all posts and display from paginator
  
  setupNextPageClick('all_posts', section, null);
  setupPostClick();


}