

let currentsong = new Audio();
let songs;
let currFolder;
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  const formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://192.168.18.13:3000/${currFolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = " ";
  for (let i = 0; i < songs.length; i++) {
    songs[i] = songs[i].replace(".mp3", "");
  }

  for (const song of songs) {
    songUL.innerHTML += `<li class="songconc">
                            <img class="invert" src="images/music.svg" alt="">
                            <div class="info">
                                <div style="display: none;" class="songTitle">${song.replaceAll(
                                  "%20",
                                  " "
                                )}</div>
                                <div class="songTitle">${
                                  song.replaceAll("%20", " ").split("-")[1]
                                }</div>
                                <div>${
                                  song.replaceAll("%20", " ").split("-")[0]
                                }</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="images/play.svg" alt="">
                            </div> 
                        </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      let selectedSong =
        e.querySelector(".info").firstElementChild.innerHTML + ".mp3";
      playmusic(selectedSong);
    });
  });
}

const playmusic = (track, pause = false) => {
  currentsong.src = `${currFolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "/images/pause.svg";
  }
  let playingsong = decodeURI(track.replace(".mp3", " "));
  document.querySelector(".songinfo").innerHTML = playingsong.split("-")[1];
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://192.168.18.13:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  
  let cardContainer = document.querySelector(".cardContainer");
  let albumCardsHTML = '';

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(
        `http://192.168.18.13:3000/songs/${folder}/info.json`
      );
     
      let response = await a.json();
      
      albumCardsHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="40" color="#000000" fill="none">
              <circle cx="11" cy="12" r="11.5" fill="#3e40a3" stroke="#3e40a3" stroke-width="1" />
              <path transform="scale(0.7) translate(4.5, 5)" d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="white" stroke="white" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </div> 
          <img src="songs/${folder}/cover.jpeg" alt="">
          <h2></h2>
          <p>${response.description}</p>
        </div>`;
    }
  }

  // Set the innerHTML of the cardContainer once, with all album cards
  cardContainer.innerHTML = albumCardsHTML;

  // Add freespace after all albums have been added
  let freespace = document.createElement("div");
  freespace.style.width = "400px";
  freespace.style.height = "400px";
  freespace.classList.add("freespace");
  cardContainer.appendChild(freespace);

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      await getsongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}


async function main() {
  await getsongs("/songs/BadlilVibe");
  let playfirst = songs[0] + ".mp3";
  playmusic(playfirst, true);
  
  displayAlbums();
  let freespace = document.createElement("div");
  freespace.innerHTML = `<div style="width: 200px; height: 200px;" class="freespace"></div>`;
  document.querySelector(".cardContainer").prepend(freespace);
  document.getElementById("play").addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "/images/pause.svg";
    } else {
      currentsong.pause();
      play.src = "/images/play.svg";
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentsong.currentTime
    )}/${formatTime(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = -100 + "%";
  });
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  previous.addEventListener("click", () => {
    console.log("next clicked");
    let currentSongFile = currentsong.src.split("/").pop();
    console.log("Current Song File:", currentSongFile);
    let index = songs.findIndex((song) => song + ".mp3" === currentSongFile);

    if (index - 1 >= 0) {
      playmusic(songs[index - 1] + ".mp3");
    } else {
      console.log("No more songs in the playlist");
    }
  });
  next.addEventListener("click", () => {
    console.log("next clicked");
    let currentSongFile = currentsong.src.split("/").pop();
    console.log("Current Song File:", currentSongFile);
    console.log(currentsong.src.split("/").slice(-1)[0]);
    let index = songs.findIndex((song) => song + ".mp3" === currentSongFile);

    if (index >= 0 && index + 1 < songs.length) {
      playmusic(songs[index + 1] + ".mp3");
      console.log("Playing:", songs[index + 1] + ".mp3");
    } else {
      console.log("No more songs in the playlist");
    }
  });
  document.querySelector(".volran").addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;
  });
  document.querySelector(".volimg").addEventListener("click", (e) => {
    if(currentsong.volume > 0){
      currentsong.volume = 0;
      e.target.src = "/images/mute.svg";
    }
    else if(currentsong.volume == 0){
      currentsong.volume = 1;
      e.target.src = "/images/volume.svg";
    }
  }
  )
}

main();
