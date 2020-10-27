
document.addEventListener('DOMContentLoaded', function() {

  var path = window.location.href;
  console.log(`href is: ${path}`);
  var id = null;

  
  

  
  var loadSection = 1;
 
  
  if( (path.split('#')[1] != null) && path.split('#')[1].length > 1){
    path = window.location.href.split('#')[1];
    var pageNum = path.split('=')[1];
    
    var currentPage = path;
    console.log(`our current split url is: ${currentPage}`)
    if(currentPage.includes('/') && typeof currentPage.split('/')[2] !== 'undefined'){
      page = currentPage.split('/')[1];
      console.log(`we just assigned page: ${page}`)
      id = currentPage.split('?')[0];
      id = id.split('/')[2]

    }else if(currentPage.includes('?')){
      page = currentPage.split('?')[0];
      page = page.split('/')[1];
      pageNum = currentPage.split('=')[1];
      console.log(`we just pulled the page num param: ${pageNum}`)
      console.log(`parsing the page num gives us: ${parseInt(pageNum, 10)}`)
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

function setupUserNameClick(){
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

}




async function loadPage(page, id, section){
  console.log(`value of id is ${id}`)
  if( page == null){
    page = "all_posts";
  }

  if(id == null && section == null){
    section = 1;
    console.log(`our page value is: ${page}`)
    if( page == "all_posts"){
      console.log(`Our current page value is: ${page}`)
      history.pushState({page: page, section:section}, "", `#/${page}?page=${section}`)
      console.log("calling all posts - page 1")
      allPosts(section);
    }
    else if(page == "user"){
      //need to figure out how to handle the history push



      id = await getUserId()
      console.log(`Our user id that made it out of the func is: ${id}`)
      
      
      history.pushState({page: page, id:id, section:section}, "", `#/${page}/${id}?page=${section}`)
      userPage(section,id);
    }else if(page == "following"){
      
        id = await getUserId()
        console.log(`first follow- id is: ${id}`)
        
      
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
      
      console.log(`Our user id that made it out of the func is: ${id}`)
      
      userPage(id, section);

    }else if(page == "following"){
      
  
      console.log(`starting to load following page with id: ${id}`)
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
  console.log(event.state.page);
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


  for(i=1; i<lenPosts; i++){
    var user = posts[i][0];
    var text = posts[i][1];
    var likes = posts[i][2];
    var date = posts[i][3];
    var id = posts[i][4];
    console.log(`user: ${user}, userId: ${id} text: ${text}, likes: ${likes}, date:${date}` );
    var post = `<li class="page-item"><h5 class="user" data-id=${id}>${user}</h5><h6 class="post_text" onclick> ${text}</h6><small class="likes"> Likes: ${likes}</small> <Br><small class="date">   Created:${date}</small></li>`;
    results= results + post;

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
  console.log("seting up click for next");
  section = parseInt(section);
  if(page == "all_posts"){


    document.querySelectorAll('.next').forEach( nextButton => {
      nextButton.onclick = function(){
        section = section + 1;
        history.pushState({page: page, section:section}, "", `#/${page}?page=${section}`)
        allPosts(section);
        console.log("we just clicked the next button")

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
  console.log(posts);
  const following = posts[0][2];
  const followed = posts[0][3];
  const user = posts[0][0];

  const userHTML = `<div id='user_section'><h2 id='user_header'>${user}</h2> <br> <h6 id="followers"> Number of Followers: ${following}</h6> <h6 id="following"> Following: ${followed} Users</h6></div>` ;

  
  document.querySelector('#user_page').innerHTML = userHTML;
  var results = postHTML(posts);

  

  document.querySelector('#all_posts').innerHTML = results;
  //get all posts and display from paginator



  setupNextPageClick('user', section, id);
  setupUserNameClick();

};


async function getUserPosts(id,section){
  const url = `api/user/${id}?page=${section}`
  
  console.log(`fetching the url: ${url}`)
  const response = await fetch(url)
  const body = await response.json()
  
  return body;

}

async function followingPosts(section, id){
  clearAll();

  document.querySelector('#all_posts').style.display = 'block'

  var posts = await getFollowingPosts(id, section);
  console.log(posts);

  var results = postHTML(posts);
  

  document.querySelector('#all_posts').innerHTML = results;
  //get all posts and display from paginator

  setupNextPageClick('following', section, id);
  setupUserNameClick();
}



async function getFollowingPosts(id,section){
  const url = `api/following/${id}?page=${section}`
  
  console.log(`fetching the url: ${url}`)
  const response = await fetch(url)
  const body = await response.json()
  
  return body;

}



async function getUserId(){
  var userid;

  const response = await fetch('api/user')
  const body = await response.json()
  console.log(`our userid body is: ${body['id']}`)
  userid = body['id']
  console.log(`our user id is: ${userid}`)

  return userid;
}

async function getAllPosts(section){
  const url = `api/all_posts?page=${section}`
  
  console.log(`fetching the url: ${url}`)
  const response = await fetch(url)
  const body = await response.json()
  
  return body;
}

async function allPosts(section){
  clearAll();
  document.querySelector('#all_posts').style.display = 'block'

  var posts = await getAllPosts(section);
  console.log(posts);

  var results = postHTML(posts);
  

  document.querySelector('#all_posts').innerHTML = results;
  //get all posts and display from paginator
  
  setupNextPageClick('all_posts', section, null);
  setupUserNameClick();


}