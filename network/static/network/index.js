
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
      
      userPage(section,id);

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

async function allPosts(section){
  clearAll();
  document.querySelector('#all_posts').style.display = 'block'

  var posts = await getAllPosts(section);
  console.log(posts);
  var lenPosts = Object.keys(posts).length;

  var results =`<nav aria-label="Page navigation example">
                  <ul class="pagination">`;

  for(i=0; i<lenPosts; i++){
    var user = posts[i][0];
    var text = posts[i][1];
    var likes = posts[i][2];
    var date = posts[i][3];
    var id = posts[i][4];
    console.log(`user: ${user}, userId: ${id} text: ${text}, likes: ${likes}, date:${date}` );
    var post = `<br><div class="page-item"><a class="user">${user}</a><h6 class="post_text" onclick> ${text}</h6><small class="likes">${likes}</small><small class="date">${date}</small></div>`;
    results= results + post;

  }

  var wrap = `</ul> </nav>`;
  results = results + wrap;
  console.log(`Our html is: ${results}`)



//     <li class="page-item"><a class="page-link" href="#">Previous</a></li>
//     <li class="page-item"><a class="page-link" href="#">1</a></li>
//     <li class="page-item"><a class="page-link" href="#">2</a></li>
//     <li class="page-item"><a class="page-link" href="#">3</a></li>
//     <li class="page-item"><a class="page-link" href="#">Next</a></li>
//   </ul>
// </nav>`


  document.querySelector('#all_posts').innerHTML = results;
  //get all posts and display from paginator
  
}

function userPage(id,section){
  clearAll();
  //need to fetch user information
  //then search based off of that user info


};

async function followingPosts(section, id){
  clearAll();
  //need to fetch user information
  //then filter based off of followers
  console.log("asking for following request")
  

  document.querySelector('#following_posts').style.display = 'block'

  const response = await fetch(`api/following/${id}?page${section}`)  

  const body = await response.json();
  console.log(`our body is: ${body['user']}`)

  document.querySelector('#following_posts').innerHTML = body['user'];

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