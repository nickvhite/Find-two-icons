window.onload = function() {
	var game;
	var gamePlay = new GamePlay();
	function createAjax() {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://kde.link/test/get_field_size.php', true);
		xhr.send();
		xhr.onload = function() {
			try {
				var data = JSON.parse(xhr.responseText);
				var imageCount = data.width*data.height;
				if(imageCount%2
					||data.width<4
					||data.height<4
					||data.width>8
					||data.height>8) {
					createAjax();
				}else{
					gamePlay.notGuessedCouple = (data.width*data.height)/2;
					createGame(data.width, data.height);
				}
			} catch(err) {
				console.log(err);
			}
		}
	}

	function Game(width, height) {
		this.imageCount = width*height;
		this.imageCollection = this.createImages();
		this.imageIdArray = new Array(this.imageCount);
	}


	Game.prototype.createGameTable = function(width, height) {
		var table = document.getElementById('game__page__table');
		table.innerHTML = "";
		var tbody = table.appendChild(document.createElement("tbody"));
		for(var i=1; i<=height; i++) {
			var tr = document.createElement("tr");
			tbody.appendChild(tr);
			for(var j=1; j<=width; j++) {
				var td = document.createElement("td");
				td.classList.add("game__page__table__cell");
				tr.appendChild(td);
			}
		}
		tbody.onclick = function(even){
			var target;
			if(even.target.nodeName === 'TD'){
				target = even.target;
			}else if(even.target.nodeName === 'TBODY'){
				return;
			}else{
				target = even.target.parentNode;
			}
			gamePlay.steps +=1;
			gamePlay.openImage(target);
			gamePlay.writeImage(target);
		}
	}

	Game.prototype.createImages = function() {
		var images = {};
		var imageId = 0;
		for(var i = 0; i<10; i++) {
			images[imageId] = {url: "https://kde.link/test/"+imageId+".png"};
			imageId++;
		}
		return images;
	}

	var lastImage = false;

	Game.prototype.findCell = function(imageId) {
		var fieldIndex = this.positionValidation(rand(0, this.imageCount));
		if(lastImage) {
			this.addImage(0, imageId);
			lastImage = false;
		}
		if(fieldIndex) {
			this.addImage(fieldIndex, imageId);
		}else{
			this.findCell(imageId);
		}
	}

	Game.prototype.addImage = function(fieldIndex, imageId){
		var gameCells = document.querySelectorAll('.game__page__table__cell');
		var img = document.createElement('img');
		var p = document.createElement('p');
		p.classList.add('game__page__table__cell_question');
		img.setAttribute('src', this.imageCollection[imageId].url);
		img.classList.add('game__page__table__cell_image');
		p.textContent = '?';
		img.setAttribute('hidden', true);
		gameCells[fieldIndex].appendChild(img);
		gameCells[fieldIndex].appendChild(p);
		this.imageIdArray[fieldIndex] = imageId;
		gameCells[fieldIndex].setAttribute('id', imageId);
		gameCells[fieldIndex].classList.add('animated');
	}

	Game.prototype.fillingImages = function() {
		var imageId = 0;
		for(var i=0; i<(this.imageCount/2); i++) {
			this.findCell(imageId);
			if(i===((this.imageCount/2)-1)){
				lastImage=true;
			}
			this.findCell(imageId);
			imageId++;
			if(imageId>9){
				imageId=0;
			}
		}
	}

	Game.prototype.positionValidation = function(id) {
		if(this.imageIdArray[id] == undefined) {
			return id;
		} else if(lastImage===0){
			return 0;
		}else{
			return false;
		}
	}

	function createGame(width, height) {
		game = new Game(width, height);
		game.createGameTable(width,height);
		game.fillingImages();
	}

	function rand(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}
	
	function GamePlay() {
		this.steps = 0;
		this.score = 300;
	}

	GamePlay.prototype.openImage = function(target) {
		var that = this;
		if(that.steps<=1){
			that.interval = that.startScore();
		}
		target.classList.add('open');
		setTimeout(function(){
			target.classList.remove('open');
			target.classList.add('close');
			that.showHideImage(target);
		}, 300);
	}

	GamePlay.prototype.writeImage = function(target){
		if(!this.openedImage) {
			this.openedImage = target;
		}else if(this.openedImage === target){
			this.openedImage = '';
			this.currentOpenImage = '';
		} else{
			this.currentOpenImage = target;
			this.compareImages();
		}
	}

	GamePlay.prototype.compareImages = function(target){
		var that = this;
		var firstImage = that.openedImage;
		var secondImage = that.currentOpenImage;
		if(this.openedImage.getAttribute('id') === this.currentOpenImage.getAttribute('id')){
			setTimeout(function(){
				firstImage.style.visibility = 'hidden';
				secondImage.style.visibility = 'hidden';
				that.notGuessedCouple-=1;
				that.finishGame();
			}, 500);
		} else {
			setTimeout(function(){
				that.openImage(firstImage);
				that.openImage(secondImage);
			}, 500)
		}
		that.openedImage = '';
		that.currentOpenImage = '';
	}

	GamePlay.prototype.showHideImage = function(targetElement) {
		var target = targetElement;
		targetElement.children[0].hidden = !targetElement.children[0].hidden;
		targetElement.children[1].hidden = !targetElement.children[1].hidden;
		setTimeout(function(targetElement){
			target.classList.remove('close');
		}, 150)
	}

	GamePlay.prototype.finishGame = function() {
		if(this.notGuessedCouple <= 0) {
			gameScore.textContent = 'SCORE: '+this.score;
			gameSteps.textContent = "STEPS: "+this.steps;
			setTimeout(function(){
				gamePage.style.display = 'none';
				backButton.style.display = 'none';
				finishPage.style.display = 'block';
			}, 200);
		}
	}

	GamePlay.prototype.startScore = function() {
		var that = this;
		var interval = setInterval(function(){
			that.score-=1;
		}, 1000);
		return interval;
	}

	function hidePage(page){
		page.classList.add('bounceOutDown');
		options.classList.add('bounceOutDown');
		setTimeout(function(){
			if(page === startPage || page === finishPage) {
				showLoader();
			}
			page.style.display = 'none';
			options.style.display = 'none';
		}, 550)
	}

	function showPage(page){
		var timeOut = 1000;
		if(page === gamePage) {
			timeOut = 2500;
		}
		setTimeout(function(){
			hideLoader();
			page.style.display = 'flex';
			page.classList.add('bounceInDown');
			options.style.display = 'block';
			options.classList.add('bounceInDown');
			if(page.getAttribute('id')==='game__page'){
				backButton.style.display = 'inline-block';
			}else if(page.getAttribute('id')==='start__page'){
				backButton.style.display = 'none';
			}
			setTimeout(removeAnimation, 1000);
		}, timeOut);
	}

	function removeAnimation(pageOne, pageTwo){
		startPage.classList.remove('bounceInDown');
		startPage.classList.remove('bounceOutDown');
		gamePage.classList.remove('bounceInDown');
		gamePage.classList.remove('bounceOutDown');
		options.classList.remove('bounceInDown');
		options.classList.remove('bounceOutDown');
		finishPage.classList.remove('bounceInDown');
		finishPage.classList.remove('bounceOutDown');
	}

	function showLoader(){
		setTimeout(function(){
			loader.style.display = 'block';	
		}, 300);
	}

	function hideLoader(){
		loader.style.display = 'none';
	}

	var startButton = document.getElementById('start__button');
	var startPage = document.getElementById('start__page');
	var gamePage = document.getElementById('game__page');
	var backButton = document.getElementById('option__back');
	var options = document.getElementById('option');
	var loader = document.getElementById('loader');
	var finishPage = document.getElementById('congratulation');
	var gameScore = document.querySelectorAll('.congratulation__score')[0];
	var gameSteps = document.querySelectorAll('.congratulation__steps')[0];
	var ressetButton = document.querySelectorAll('.congratulation__buttons__resset')[0];
	var quitButton = document.querySelectorAll('.congratulation__buttons__quit')[0];
	
	startButton.onclick = function() {
		createAjax();
		hidePage(startPage);
		showPage(gamePage);
	}

	backButton.onclick = function() {
		hidePage(gamePage);
		showPage(startPage);
		gamePlay.steps = 0;
		gamePlay.score = 300;
		clearInterval(gamePlay.interval);
	}

	quitButton.onclick = function() {
		window.close();
	}

	ressetButton.onclick = function() {
		createAjax();
		hidePage(finishPage);
		showPage(gamePage);
	}
}
