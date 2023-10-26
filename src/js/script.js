
// Data da api para buscar os filmes

async function getMovies() {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWVjYzIzMzk4NGU1MjBmZWI1ZjVjNDI2NmE3ODZhYiIsInN1YiI6IjY0ZDI2MjM3OTQ1ZDM2MDEzOTRmMmExYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UrkcEOOnHF6SfwCJHyFFUMSWaXI4__ULwvS-YHhRAVs'
        }
    };

    try {
        return fetch('https://api.themoviedb.org/3/movie/popular', options)
        .then(response => response.json())
    } catch (error) {
        console.log(error)
    }
}

//Função para puxar informações extras do filme.

async function getMoreInfo(id){
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWVjYzIzMzk4NGU1MjBmZWI1ZjVjNDI2NmE3ODZhYiIsInN1YiI6IjY0ZDI2MjM3OTQ1ZDM2MDEzOTRmMmExYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UrkcEOOnHF6SfwCJHyFFUMSWaXI4__ULwvS-YHhRAVs'
        }
    };

    try {
        const data = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=pt-BR`, options)
                            .then(response => response.json())
    
        return data
    } catch (error) {
        console.log(error)
    }


}

//Função criada para alteração do layout no html e adição dos elementos da api

function createMovieLayout({
    title,
    stars,
    image,
    time,
    year,
    description,
    genres,
    videoUrl
}) {
    return `
    <div class="movie">
        <div class="title">
            <span>${title}</span>
            <div>
                <img src="src/assets/icones/Star.svg" alt="Icone estrela de avaliação">
                <p>${stars}</p>
            </div>
        </div>

        <div class="poster">
            <img src="https://image.tmdb.org/t/p/w500${image}" alt="Imagem de ${title} ">
        </div>

        <div class="genres">
            <ul class="types">
                ${genres.map((genres) => `<li class="type ${genres}">${genres}</li>`).join('')}
            </ul>
        </div>

        <div class="description">
            <div class="">
                <p>${description}</p>
            </div>
        </div>

        <div class="info">
            <div class="duration">
                <img src="src/assets/icones/Clock.svg" alt="">
                <span>${time}</span>
            </div>

            <div class="year">
                <img src="src/assets/icones/CalendarBlank.svg" alt="">
                <span>${year}</span>
            </div>
        </div>


        <a href="https://m.youtube.com/watch?v=${videoUrl}" id="btn-trailer" target="_blank">
            <img src="src/assets/icones/play-icone.svg" alt="">
            <span>Assistir Trailer</span>
        </a>
    </div>
    `
    // para a criação do botão iremos na api para procurar onde ele está hospedado dentro do banco de dados.
    // Ao achar buscar pelo teaser para testar se é esse mesmo e assim importalo
};

//Função para selecionar os videos aleatoriamente
function selectVideos(results){
    const random = ()=> Math.floor(Math.random() * results.length);

    let selectedVideos = new Set()
    while(selectedVideos.size < 4){
        selectedVideos.add(results[random()].id)
    }

    return [...selectedVideos]
};

//Função para transformar o tempo do filme de minutos para horas minutos e segundos

function minutesToHoursMinutesAndSeconds(minutes){
    const date = new Date(null)
    date.setMinutes(minutes)
    return date.toISOString().slice(11, 19)
}

//função inicial que irá rodar as alterações

async function start(){
    //pegar as sugestões de filmes na api

    const { results } = await getMovies()

    //pegar randomicamente 3 filmes para sugestão
    const bestVideos = selectVideos(results).map(async movie => {

        //pegar informações extras dos filmes
        const info = await getMoreInfo(movie)

        //Abrir o trailer quando clicar no botão
        const videoURL = async (info) => {
            const options = {
                method: 'GET',
                headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWVjYzIzMzk4NGU1MjBmZWI1ZjVjNDI2NmE3ODZhYiIsInN1YiI6IjY0ZDI2MjM3OTQ1ZDM2MDEzOTRmMmExYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UrkcEOOnHF6SfwCJHyFFUMSWaXI4__ULwvS-YHhRAVs'
                }
            };

            try {
                const dataForTrailer = await fetch(`https://api.themoviedb.org/3/movie/${info.id}/videos?language=pt-BR`, options)
                                                .then(response => response.json())
                                                .then(results => results);
    
                const videoUrlPt = dataForTrailer.results.find((video) => video.type === "Trailer")?.key;

                return videoUrlPt
            } catch (error) {
                console.error(error);
            };
        };

        //organizar os dado para ...
        const props = {
            title: info.title,
            stars: Number(info.vote_average).toFixed(1),
            image: info.poster_path,
            time: minutesToHoursMinutesAndSeconds(info.runtime),
            year: info.release_date.slice(0, 4),
            description: info.overview,
            genres: info.genres.map((genresSlot) => genresSlot.name),
            videoUrl: await videoURL(info)
        }

        return createMovieLayout(props)
    })
    
    const output = await Promise.all(bestVideos)

    //subistituir o conteudo dos movies no html
    document.querySelector('.movies').innerHTML = output.join("")
};

start()
