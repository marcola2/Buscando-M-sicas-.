function letra()
{
	var music = document.querySelector("#music");
	var artista = document.querySelector("#artista");
	var musica = document.querySelector("#musica");
	var musico = document.querySelector("#musico");

	music.innerHTML = musica.value;
	artista.innerHTML = musico.value;

	function showLetra (data,art,mus,arrayid) 
	{
		if (! arrayid) arrayid = 0;

		if (data.type == 'exact' || data.type == 'aprox') {
			// Print lyrics text
			$('#letra .text').text(data.mus[arrayid].text);

			// Show buttons to open original and portuguese translation
			if (data.mus[arrayid].translate) {
				$('#letra .text').prepend('<input type=button value="Português &raquo;" onClick="$(document).trigger(\'translate\')"><br/>');
				$(document).one('translate',function() {
					$('#letra .text').text(data.mus[arrayid].translate[0].text);
					$('#letra .text').prepend('<input type=button value="&laquo; Original" onClick="$(document).trigger(\'original\')"><br/>');
					$(document).one('original',function() {
						showLetra(data,art,mus,arrayid);
					});
				});
			}

			// If not exact match (ex: U2 / Beautiful)
			if (data.type == 'aprox' && !$('#aprox').is('div')) {
				$('#letra').prepend('<div id=aprox>We found something similar<br/><span class=songname>"' + data.mus[arrayid].name + '"</span></div>');

				// If Vagalume found more than one possible matches
				if (data.mus.length > 0) {
					var html = '<select class=songselect>';
					for (var i = 0; i < data.mus.length; i++) {
						html += '<option value="'+i+'"'+(i==arrayid?' selected':'')+'>'+data.mus[i].name+'</option>';
					}
					html += '</select>';
					$('#aprox span.songname').html(html);
					$('#aprox select.songselect').change(function() {
						var aID = $('option:selected',this).val();
						showLetra (data,art,mus,aID);
					});
				}
			}
		} else if (data.type == 'song_notfound') {
			// Song not found, but artist was found
			// You can list all songs from Vagalume here
			$('#letra .text').html(
				'<p id="texto-erro">Eita, vai dar certo. Pesquise outra música.</p>'
			);
		} else {
			// Artist not found
			$('#letra .text').html(
				'<p id="texto-erro">Vixe! Tente novamente com o nome do artista. Ou tente outro artista.</p>'
			);
		}
	}

	function fetchLetra (art,mus,serial,udig) {
		var data = jQuery.data(document,art + mus); // cache read
		if (data && !data.captcha) {
			showLetra(data, art, mus);
			return true;
		}

		var url = "https://api.vagalume.com.br/search.php"
			+"?apikey=049e349a911c844965c245e9df4d4f75"
			+"&art="+encodeURIComponent(art)
			+"&mus="+encodeURIComponent(mus);

		if (serial && udig) url += "&serial="+encodeURIComponent(serial)+"&udig="+encodeURIComponent(udig);

		console.log(url);
		
		fetch(url)
		.then((resposta) => resposta.json())
		.then((data) => {
			console.log(data);
			// In case we reach the rate limit, we must ask user to type the captcha
			if (data.captcha) {
				var html = '<div id=captcha>Type the 4 numbers bellow<br/>to load this lyrics:<br/>';
				    html +='<img src="'+data.captcha_img+'"><br/>';
				    html +='<input type=text id=udig size=4 maxlength=4>';
				    html +='<input type=button onClick="$(document).trigger(\'refetch\')" value="Continue &raquo;"></div>';
				$(document).one("refetch",function() { fetchLetra(art,mus,data.serial,document.getElementById("udig").value); });
				$('#letra .text').html(html);
			} else {
				// What we do with the data
				jQuery.data(document,art + mus,data); // cache write
				showLetra(data, art, mus);
			}			
		})
		.catch((erro) => {
			console.error(erro);
		});
	}

	// Just an example of how you can call this using elements on the page
	fetchLetra($("#artista").text(), $("#music").text());
}

var botao = document.querySelector("#botao");
botao.addEventListener('click', letra);
