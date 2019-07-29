/*
 * Alpha Sub Train Widget v1.1.0
 * - HarrisHeller (@HarrisCHeller)
 * - SWDoctor (@SWDoctor)
 * - thefyrewire (@MikeyHay)
 * Modified by Rhapsody (@Rhapsody_Sky) to add the shiny versions
*/

const prefs = {};
let trainTimeout, trainTimeoutLock, trainAmount = 0, trainLocked = false, sane = false, trainLine, trainStation, trainRunning = false;

window.addEventListener('onWidgetLoad', obj => {
  const fields = obj.detail.fieldData;
  if (fields.trainTime < 0) return;
  prefs.trainTime = fields.trainTime;
  prefs.trainTheme = fields.trainTheme;
  prefs.trainType = fields.trainType;
  prefs.trainOrientation = (fields.trainOrientation === 'horizontal') ? 'left' : 'top';
  prefs.trainDirection = fields.trainDirection;
  prefs.trainWidth = (fields.trainWidth > 0) ? fields.trainWidth : 0;
  prefs.trainGiftTriggers = fields.trainGiftTriggers;
  prefs.lineHeight = (fields.lineHeight > 0) ? fields.lineHeight : 0;
  prefs.shinyChance = fields.shinySpriteChance;
  console.log(prefs.shinyChance);

  const textTrain = '<div class="text-train-container"><span class="text-train"></span></div>';
  const textTrainIcon = '<span class="text-train-icon"></span>';
  $('.container').append('<div class="container-train"></div>');

  switch (prefs.trainOrientation) {
    case 'left':
      $('.container, .container-train').css('flex-direction', 'row');
      $('.container-train').css('width', `${prefs.trainWidth}%`);
      break;
    case 'top':
      $('.container, .container-train').css('flex-direction', 'column');
      $('.container-train').css('height', `${prefs.trainWidth}%`);
      break;
  }

  switch (prefs.trainDirection) {
    case 'left':
      $('.container').prepend(textTrain);
      break;
    case 'right':
        $('.container').append(textTrain);
      break;
  }

  if (fields.iconEnabled === 'yes') {
    switch (fields.iconSide) {
      case 'left':
        $('.text-train-container').css('flex-direction', 'row').prepend(textTrainIcon);
        break;
      case 'right':
          $('.text-train-container').css('flex-direction', 'row').append(textTrainIcon);
        break;
      case 'top':
        $('.text-train-container').css('flex-direction', 'column').prepend(textTrainIcon);
        break;
      case 'bottom':
          $('.text-train-container').css('flex-direction', 'column').append(textTrainIcon);
        break;
    }

    switch (prefs.trainType) {
      case 'subscriber-latest':
        prefs.trainIcon = 'F';
        break;
      case 'cheer-latest':
        prefs.trainIcon = 'A';
        break;
      case 'follower-latest':
        prefs.trainIcon = 'S';
        break;
    }
  }

  if (fields.trainPlacementMode === 'on') {
    switch (prefs.trainType) {
      case 'follower-latest':
      case 'subscriber-latest':
        prefs.testAmount = `${(Math.floor(Math.random()*(20-1+1))+1)}`;
        break;
      case 'cheer-latest':
        const cheers = ['5', '10', '100', '2000'];
        prefs.testAmount = cheers[Math.floor(Math.random()*cheers.length)];
        break;
    }
    $('.text-train').text(prefs.testAmount);
    $('.text-train-icon').text(prefs.trainIcon);
    $('.text-train-container').css('visibility', 'visible');
  }

  if (prefs.trainTheme === 'sprites') {
    if ((!fields.spriteEndImage && !fields.spriteEndVideo) || (!fields.spriteStartImage && !fields.spriteStartVideo)) return;
    if (fields.spriteEndImage && fields.spriteEndImage.length !== 0) prefs.spriteEnd = {'src': fields.spriteEndImage, 'type': 'img'}
    else if (fields.spriteEndVideo && fields.spriteEndVideo.length !== 0) prefs.spriteEnd = {'src': fields.spriteEndVideo, 'type': 'video'}
    else return;
    if (fields.spriteStartImage && fields.spriteStartImage.length !== 0) prefs.spriteStart = {'src': fields.spriteStartImage, 'type': 'img'}
    else if (fields.spriteStartVideo && fields.spriteStartVideo.length !== 0) prefs.spriteStart = {'src': fields.spriteStartVideo, 'type': 'video'}
    else return;
    /* Check if the shiny versions are uploaded*/
    if (fields.shinySpriteEndImage && fields.shinySpriteEndImage.length !== 0) prefs.shinySpriteEnd = {'src': fields.shinySpriteEndImage, 'type': 'img'}
    else if (fields.shinySpriteEndVideo && fields.shinySpriteEndVideo.length !== 0) prefs.shinySpriteEnd = {'src': fields.spriteEndVideo, 'type': 'video'}
    else return;
    if (fields.shinySpriteStartImage && fields.shinySpriteStartImage.length !== 0) prefs.shinySpriteStart = {'src': fields.shinySpriteStartImage, 'type': 'img'}
    else if (fields.shinySpriteStartVideo && fields.shinySpriteStartVideo.length !== 0) prefs.shinySpriteStart = {'src': fields.shinySpriteStartVideo, 'type': 'video'}
    else return;
  
    
  
    const char = document.createElement(prefs.spriteStart.type);
    char.src = prefs.spriteStart.src;
    char.classList = ['sprite char'];
    char.style[prefs.trainOrientation] = (prefs.trainDirection === 'left') ? 'calc(100% - calc({{spriteStartWidth}}px + {{spriteEndWidth}}px))' : '0';
    if (prefs.spriteStart.type === 'video') char.loop = true;
  
    const end = document.createElement(prefs.spriteEnd.type);
    end.src = prefs.spriteEnd.src;
    end.classList = ['sprite end'];
    end.style[prefs.trainOrientation] = (prefs.trainDirection === 'left') ? '0' : 'calc(100% - calc({{spriteStartWidth}}px + {{spriteEndWidth}}px))';
    
    /* Create the shiny characters*/
    const shinyChar = document.createElement(prefs.shinySpriteStart.type);
    shinyChar.src = prefs.shinySpriteStart.src;
    shinyChar.classList = ['sprite char shinyChar'];
    shinyChar.style[prefs.trainOrientation] = (prefs.trainDirection === 'left') ? 'calc(100% - calc({{spriteStartWidth}}px + {{spriteEndWidth}}px))' : '0';
    if (prefs.shinySpriteStart.type === 'video') shinyChar.loop = true;
  
    const shinyEnd = document.createElement(prefs.shinySpriteEnd.type);
    shinyEnd.src = prefs.shinySpriteEnd.src;
    shinyEnd.classList = ['sprite end shinyEnd'];
    shinyEnd.style[prefs.trainOrientation] = (prefs.trainDirection === 'left') ? '0' : 'calc(100% - calc({{spriteStartWidth}}px + {{spriteEndWidth}}px))';
    
    
    /* Attatch the normal characters together with the shiny versions*/
    $('.container-train').append(prefs.trainDirection === 'left' ? [end, char, shinyEnd, shinyChar] : [char, end, shinyChar, shinyEnd]);
    
    if (fields.trainPlacementMode === 'on') {
      $('.sprite').css('display', 'inline-flex');
      return;
    }
  } else {
    
    $('.container-train').append('<div class="line"></div><div class="line-bg"></div>');
    switch (prefs.trainOrientation) {
      case 'left':
        $('.line, .line-bg').css('width', '100%').css('height', `${prefs.lineHeight}px`);
        prefs.lineScale = 'scaleX';
        break;
      case 'top':
        $('.line, .line-bg').css('height', '100%').css('width', `${prefs.lineHeight}px`);
        prefs.lineScale = 'scaleY';
        break;
    }
    $('.line, .line-bg').css('transform-origin', (prefs.trainOrientation === 'left') ? ((prefs.trainDirection === 'left') ? '0% 50%' : '100% 50%') : ((prefs.trainDirection === 'left') ? '50% 0%' : '50% 100%')).css('transform', `${prefs.lineScale}(0)`);
    if (fields.trainPlacementMode === 'on') {
      $('.line').css('transform', `${prefs.lineScale}(0.7)`);
      $('.line-bg').css('transform', `${prefs.lineScale}(1)`);
      return;
    }
  }
  sane = true;
});

window.addEventListener('onEventReceived', obj => {
  if (!sane || trainLocked) return;
  if (obj.detail.listener !== prefs.trainType) {
    SE_API.resumeQueue();
    return;
  }
  const event = obj.detail.event;
  switch (prefs.trainType) {
    case 'subscriber-latest':
      if (((event.gifted && !event.isCommunityGift) || event.bulkGifted) && prefs.trainGiftTriggers === 'yes') {
        const amount = (event.amount === 'gift') ? 1 : event.amount;
        decideYourFate(amount);
      } else if (!event.gifted && !event.bulkGifted) {
        decideYourFate(1);
      }
      break;
    case 'cheer-latest':
      decideYourFate(event.amount);
      break;
    case 'follower-latest':
      decideYourFate(1);
      break;
    default:
      SE_API.resumeQueue();
      return;
  }
});

const decideYourFate = (amount) => {
  if (trainTimeout) forfeitAllMortalPossessions();
  trainAmount += amount;
  $('.text-train').text(trainAmount);
  $('.text-train-icon').text(prefs.trainIcon);
  $('.text-train-container').css('visibility', 'visible').css('animation', 'bounceIn 0.5s forwards');

  switch (prefs.trainTheme) {
    case 'line':
      doTheLineDanceRoutine();
      break;
    case 'sprites':
      allAboardTheTrainChooChoo();
      break;
  }
}

const doTheLineDanceRoutine = () => {
  if (trainTimeout) forfeitAllMortalPossessions();
  if (trainLine || trainStation) {
    trainLine.pause();
    trainLine = null;
    trainStation.pause();
    trainStation = null;
  }
  trainStation = anime({targets: `.line${!trainRunning ? ', .line-bg' : ''}`, [prefs.lineScale]: 1, duration: 1e3, easing: 'easeInOutQuart'});

  setTimeout(() => {
    trainRunning = true;
    trainLine = anime({targets: '.line', [prefs.lineScale]: 0, duration: prefs.trainTime*1e3, easing: 'linear'});
    trainTimeout = setTimeout(() => {
      trainLocked = true;
      trainAmount = 0;
      anime({targets: '.line-bg', [prefs.lineScale]: 0, duration: 1e3, easing: 'easeInOutQuart'});
      setTimeout(() => {
        $('.text-train-container').css('animation', 'bounceOut 0.5s forwards');
        setTimeout(() => $('.text-train-container').css('visibility', 'hidden'), 500);
        trainRunning = false;
        forfeitAllMortalPossessions();
      }, 1e3);
    }, prefs.trainTime*1e3);
  }, 1e3);
}

const allAboardTheTrainChooChoo = () => {
  
  /* Decide if a shiny should show up*/
  if((Math.floor(Math.random() * 100) + 1) <= prefs.shinyChance){
    console.log('you get a shiny');
    $('.char').hide();
    $('.shinyChar').show();
    $('.end').hide();
    $('.shinyEnd').show();

  }else{
    console.log('no shiny this time');
    $('.char').show();
    $('.shinyChar').hide();
    $('.end').show();
    $('.shinyEnd').hide();
  }
  
  if (trainTimeout) forfeitAllMortalPossessions();
  if (trainLine || trainStation) {
    clearTimeout(trainLine);
    trainLine = null;
    clearTimeout(trainStation);
    trainStation = null;
  }

  if (trainRunning) {
    $('.char').css('animation', 'fadeOut 0.7s forwards');
    trainStation = setTimeout(() => {
      $('.char').css('transition', 'none').css(prefs.trainOrientation, (prefs.trainDirection === 'left') ? 'calc(100% - calc({{spriteStartWidth}}px + {{spriteEndWidth}}px))' : '0')
        .css('animation', 'fadeIn 0.7s forwards');
      if (prefs.spriteStart.type === 'video') $('.char')[0].pause();
    }, 300);
  } else {
    $('.sprite').css('display', 'inline-flex').css('animation', 'fadeIn 0.7s forwards');
    
    /* Hide all the shiny versions on first try*/
    $('.shinyChar').hide();
    $('.shinyEnd').hide();
  }

  trainLine = setTimeout(() => {
    trainRunning = true;
    $('.char').css('transition', '{{trainTime}}s linear').css(prefs.trainOrientation, (prefs.trainDirection === 'left') ? '0' : 'calc(100% - calc({{spriteStartWidth}}px + {{spriteEndWidth}}px))');
    if (prefs.spriteStart.type === 'video') $('.char')[0].play();
    SE_API.resumeQueue();
    trainTimeout = setTimeout(() => {
      trainLocked = true;
      trainAmount = 0;
      if (prefs.spriteStart.type === 'video') $('.char')[0].pause();
      if (prefs.spriteEnd.type === 'video') $('.end')[0].play();
      $('.sprite').css('animation', 'bounceOut 0.5s forwards');
      setTimeout(() => {
        $('.text-train-container').css('animation', 'bounceOut 0.5s forwards');
        setTimeout(() => $('.text-train-container').css('visibility', 'hidden'), 500);
        $('.sprite').css('display', 'none');
        $('.char').css('transition', 'none').css(prefs.trainOrientation, (prefs.trainDirection === 'left') ? 'calc(100% - calc({{spriteStartWidth}}px + {{spriteEndWidth}}px))' : '0');
        trainRunning = false;        
        forfeitAllMortalPossessions();
      }, 500);
    }, prefs.trainTime*1e3);

    trainTimeoutLock = setTimeout(() => {
      trainLocked = true;
    }, (prefs.trainTime-1)*1e3);
  }, 1e3);
}

const forfeitAllMortalPossessions = () => {
  clearTimeout(trainTimeout);
  trainTimeout = null;
  clearTimeout(trainTimeoutLock);
  trainTimeoutLock = null;
  trainLocked = false;
}