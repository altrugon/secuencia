
/*
 * Animated images that seem to rotate or move upon mouse dragging
 *
 */

 /* wish/bug list:
 * options: should contain all the other params
 * option 'reverse' to invert order
 * (maybe) option to make a mirror-image set (eg ranging from 40 to 0 to 40 again)
 * preloading should take new start frame, and work out from that not zero.
 * Also should/should not wrap around in accord with wrap_around arg.
 * and have a direction option so the start index doesn't have to be unintuitive
 */

// call it like this for horizontal dragging animation, in your Ready event:
//     new RotateWidget('myImgTagID', 'myImgTagID', 'myImgTagID', callback(i), 32);  // callback generates file URL
// your <img has id myImgTagID, and it's initial src is the 'key frame',
//    = whats shown before the user starts playing wih it (prob frame 0).
// Your thirty two image frames can be named anything that your callback can generate given
// integers 0...31, like this: function(i) { return '360_frames/'+ i +'.jpg'; }
// or if you get the wrong direction try this: function(i) { return '360_frames/'+ (31-i) +'.jpg'; }
//
// imgId = your <img, it will get different image files plugged into its src attr
// clickDownId = active element getting clickdowns, same or parent of imgId
// dragAreaId = user can drag/animate over this area, same or parent of clickDownId, maybe body
//
// call it like this for vertical dragging animation:
//     new RotateWidget('myImgTagID', callback(i, j), 1, 6);
// Your six image frames are indexed by j
// call it like this for both:
//     new RotateWidget('myImgTagID', callback(i, j), 5, 5);
// Your 25 image frames are indexed by i and j
// Don't worry about the object created; all the events will find it, you don't need it.  just construct it.
function RotateWidget(imgId, clickDownId, dragAreaId, frameURLPat, nFramesX, nFramesY, options) {
    this.options = options || {};
    this.imgjq = this.elem('image_el', $('#' + imgId)) ;
    this.imgjq[0].rotateWidget = this;  // how we find this upon events.

    this.clickjq = this.elem('click_el', $('#' + clickDownId) || this.imgjq);
    this.clickjq.mousedown(RotateWidget.down);
    this.clickjq[0].rotateWidget = this;
    this.clickjq.css('cursor', 'move');

    this.dragjq = this.elem('drag_el', $('#' + dragAreaId) || this.clickjq);
    this.dragjq.mousemove(RotateWidget.move);
    this.dragjq.mouseup(RotateWidget.up);
    this.dragjq.mouseout(RotateWidget.out);
    this.dragjq[0].rotateWidget = this;

    this.curFrameX = this.newFrameX = this.lastFrameX = this.opt('start_x', 0);
    this.curFrameY = this.newFrameY = this.lastFrameY = this.opt('start_y', 0);
    this.frameToPreloadX = this.frameToPreloadY = 0;

    this.patFunc = this.opt('filename_func', frameURLPat);
    this.wrap_around = this.opt('wrap_around', true);

    this.nX = this.opt('x_frames', nFramesX || 1);
    this.halfX = Math.floor(this.nX / 2 + .51);  // round up if odd
    this.nY = this.opt('y_frames', nFramesY || 1);
    this.halfY = Math.floor(this.nY / 2 + .51);
    this.getSizeInfo();
    var t_this = this;
    setTimeout(function() { t_this.getSizeInfo(); }, 2000);  // hopefully after the image has loaded

    // touch events only for iOS (ipad) - they disabled move events while the mouse is down in the new iOS.
    // kindof kills dragging.  and they gave us pageX & Y on the event so us retro people with only a primitive mouse
    // can pretend it's just a mouse event.
    this.clickjq.bind('touchstart', RotateWidget.down);
    this.dragjq.bind('touchmove', RotateWidget.move);
    this.dragjq.bind('touchend', RotateWidget.up);
    this.dragjq.bind('touchcancel', RotateWidget.out);
}

// return jquery-ized version of the opt_name option, or the default.  option is either a string ID, or an element
RotateWidget.prototype.opt = function opt(opt_name, def) {
    if (null == this.options[opt_name])
        return def;
    else
        return this.options[opt_name];
}

// return jquery-ized version of the opt_name option, or the default.  option is either a string ID, or an element
RotateWidget.prototype.elem = function go(opt_name, def) {
    if (null == this.options[opt_name])
        return def;
    var el = this.options[opt_name];
    if ('string' == typeof el)
        return $('#'+ el);
    else if ('object' == typeof el && 'string' == typeof el.nodeName)
        return $(el);
    return def;
}

// part of initialization, but should do it after the key image has loaded (so we get width & height)
// if it's too early, failover to a good guess given our tendency toward large graphics.
// all that's wrong is the speed of rotation is off by prob within a factor of 2
// go ahead and call this again if you want after the image has loaded.
RotateWidget.prototype.getSizeInfo = function gsi() {
    this.width = this.imgjq.width();
    this.xPerFrame = (this.width || 600) / this.nX;
    this.height = this.imgjq.height();
    this.yPerFrame = (this.height || 400) / this.nY;

    // with wrap around, you travel the distance twice.  Not so if pinned at ends.
    if (! this.wrap_around) {
        this.xPerFrame /= 2;
        this.yPerFrame /= 2;
    }
}

// part of initialization, but do it slowly.  Preload the images for faster animation (ultimately).
// Start at the starting position and move outward; those are prob the first frames needed.
RotateWidget.prototype.preloadAFew = function gsi() {
    if (this.frameToPreloadY >= this.halfY)
        return;  // done!

    // ok so load frame N and frame -N (actually last-N).  but maybe in 2 dimensions.
    // and do the frames once for each call.  and don't load any twice, even if an odd number.
    // Visualize, loop thru a square, half x half of the whole array of frames.
    // So, we load that one, and also its three reflections, but avoid the odd one, if it's odd.
    // example if the array is 1 high or 1 wide, we only do that 1 row/col cuz 1 is odd.
    (new Image()).src = this.patFunc(this.frameToPreloadX, this.frameToPreloadY);
    var compX = this.nX - this.frameToPreloadX - 1;  // from end going down
    var compY = this.nY - this.frameToPreloadY - 1;
    if (compX  > this.halfX)
        (new Image()).src = this.patFunc(compX, this.frameToPreloadY);
    if (compY  > this.halfY) {
        (new Image()).src = this.patFunc(this.frameToPreloadX, compY);
        if (compX  > this.halfX)
            (new Image()).src = this.patFunc(compX, compY);
    }
    if (this.frameToPreloadX < this.nX - this.halfX)
        this.frameToPreloadX++;
    else {
        this.frameToPreloadY++;
        this.frameToPreloadX = 0;
    }
}

// mouse down: remember this point, and that the mouse is down.
// This is a static method of the class, installed as a jQ event handler, so this is probably the img
RotateWidget.down = function dn(event) {
    // if touchstart, move, etc. re-assign X+Y values
    if(event.originalEvent.touches && event.originalEvent.touches.length) {
        event.pageX = event.originalEvent.targetTouches[0].pageX;
        event.pageY = event.originalEvent.targetTouches[0].pageY;
    }

    var rw = (event.currentTarget || event.target).rotateWidget;
    if (!rw) return;  // sometimes with IE

    // if drag regions overlap, use the one that got the clickdown event.
    RotateWidget.current = rw;

    RotateWidget.downX = event.pageX;
    RotateWidget.downY = event.pageY;

    // often click makes a textual selection that wants to be dragged.  stop that.
    event.preventDefault();
    event.stopPropagation();
}

// up or out: remember mouse is now up, and how far they dragged.
RotateWidget.up = function up(event) {
    var rw = RotateWidget.current;
    if (!rw) return;

    rw.curFrameX = rw.newFrameX;
    rw.curFrameY = rw.newFrameY;
    RotateWidget.current = null;

    event.preventDefault();
    event.stopPropagation();
}

// oh wait we also get mouseouts when user drags over a child node.. don't freak
RotateWidget.out = function up(event) {
    // see if the interfering node is a child of ours.  If so, don't stop dragging.
    for (var n = event.relatedTarget; n && n != document; n = n.parentNode)
        if (n == (event.currentTarget || event.target))
            return;

    RotateWidget.up(event)
}

// actually animate, one step at a time.
RotateWidget.move = function mv(event) {
    // if we preload only upon move events (only when mouse over our widget), they will only happen for users
    //  who might try to drag.  Not for people who immediately scroll to the bottom and never use it.
    // Also, loads happen gradually, not all at once.
    // And if the client is busy, they come more slowly so as not to choke it.

    // if touchstart, move, etc. re-assign X+Y values
    if(event.originalEvent.touches && event.originalEvent.touches.length) {
        event.pageX = event.originalEvent.targetTouches[0].pageX;
        event.pageY = event.originalEvent.targetTouches[0].pageY;
    }

    var hovering = (event.currentTarget || event.target).rotateWidget;
    if (hovering) hovering.preloadAFew();

    var rw = RotateWidget.current;
    if (!rw)
        return;  // not in a drag

    // how far, in frames, has user dragged so far
    var dx = event.pageX - RotateWidget.downX;  // how many pixels user has dragged
    rw.newFrameX = rw.curFrameX + Math.round(dx / rw.xPerFrame);
    if (rw.wrap_around)
        rw.newFrameX = rw.newFrameX - Math.floor(rw.newFrameX / rw.nX) * rw.nX;  // modulus nframes
    else
        rw.newFrameX = rw.newFrameX < 0 ? 0 : rw.newFrameX >= rw.nX ? rw.nX-1 : rw.newFrameX;  // pin to ends

    var dy = event.pageY - RotateWidget.downY;
    rw.newFrameY = rw.curFrameY + Math.round(dy / rw.yPerFrame);
    if (rw.wrap_around)
        rw.newFrameY = rw.newFrameY - Math.floor(rw.newFrameY / rw.nY) * rw.nY;
    else
        rw.newFrameY = rw.newFrameY < 0 ? 0 : rw.newFrameY >= rw.nY ? rw.nY-1 : rw.newFrameY;

    // every time you set the src, it starts a load, even if it's the same file.
    // avoid doing it needlessly.
    if (rw.lastFrameX != rw.newFrameX || rw.lastFrameY != rw.newFrameY)
        rw.imgjq.attr('src', rw.patFunc(rw.newFrameX, rw.newFrameY));

    rw.lastFrameX = rw.newFrameX;
    rw.lastFrameY = rw.newFrameY;

    event.preventDefault();
    event.stopPropagation();
}
;
