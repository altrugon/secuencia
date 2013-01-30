
/*
 * THIS IS THE 360 ROTATE
 */

// this should ultimately go ... somewhere else where some page-specific JS goes.  Or maybe just in the CMS content for this widget.
$(document).ready(function ld(){
    // model_x_rotate_widget: the <IMG that gets the images
    // outerArea: the enclosure that gets the event handlers also encloses stuff in front
    // anyBody: can be outerArea for now... if you want to be able to drag outside of the image and keep it rotating, you can make this a bigger enclosing element.  maybe not now see how it feels.
    //new RotateWidget('model_x_rotate_widget', 'outerArea', 'anyBody',
    
    
new RotateWidget('model_x_rotate_widget', 'outerArea', 'outerArea', 
    // function generates filenames given frame num.   pf = for debugging convenience
    function pf(i) {
        i = 31 - i;  // left-right inversion
        var ii = (i + 100).toFixed(0).substr(1);  // leading zero on frame num
        return '/tesla_theme/images/modelx/360_frames/'+ ii +'.jpg';
    }, 32, 1, {start_x: 0});
});


/*
 * THIS IS THE UP AND DOWN
 */
$(function() {
new RotateWidget('model_x_full_falcon', 'model_x_falcon_area', 'model_x_falcon_area', 
    function ffl(i, j) {
        return '/tesla_theme/images/modelx/falcon_frames/full'+ (40-j) +'.jpg';
    }, 1, 41, {wrap_around: false, start_y: 0});
});
