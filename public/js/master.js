(function ($) {
  "use strict";

  $(document).ready(function () {
    /* ===== REVOLUTION SLIDER LANDING ===== */

    var revapi1078,
      revapi1014,
      tpj = jQuery;

    tpj(document).ready(function () {
      /* ===== REVOLUTION SLIDER MAIN ===== */

      if (tpj("#rev_slider_1078_1").revolution == undefined) {
        revslider_showDoubleJqueryError("#rev_slider_1078_1");
      } else {
        $("#rev_slider_1078_1")
          .show()
          .revolution({
            sliderType: "standard",
            sliderLayout: "fullscreen",
            dottedOverlay: "none",
            delay: 9000,
            navigation: {
              keyboardNavigation: "off",
              keyboard_direction: "horizontal",
              mouseScrollNavigation: "off",
              mouseScrollReverse: "default",
              onHoverStop: "off",
              touch: {
                touchenabled: "on",
                swipe_threshold: 75,
                swipe_min_touches: 1,
                swipe_direction: "horizontal",
                drag_block_vertical: false,
              },
              arrows: {
                style: "hades",
                enable: true,
                hide_onmobile: true,
                hide_under: 600,
                hide_onleave: true,
                hide_delay: 200,
                hide_delay_mobile: 1200,
                tmp: '<div class="tp-arr-allwrapper"><div class="tp-arr-imgholder"></div></div>',
                left: {
                  h_align: "left",
                  v_align: "center",
                  h_offset: 0,
                  v_offset: 0,
                },
                right: {
                  h_align: "right",
                  v_align: "center",
                  h_offset: 0,
                  v_offset: 0,
                },
              },
              bullets: {
                enable: true,
                hide_onmobile: false,
                hide_under: 600,
                hide_onleave: true,
                hide_delay: 200,
                hide_delay_mobile: 1200,
                direction: "horizontal",
                h_align: "center",
                v_align: "bottom",
                h_offset: 0,
                v_offset: 30,
                space: 15,
                style: "hermes",
                tmp: '<span class="tp-bullet-inner"></span>',
              },
            },
            viewPort: {
              enable: false,
              outof: "pause",
              visible_area: "80%",
              presize: false,
            },
            responsiveLevels: [1240, 1024, 778, 480],
            visibilityLevels: [1240, 1024, 778, 480],
            gridwidth: [1240, 1024, 778, 480],
            gridheight: [600, 600, 500, 400],
            lazyType: "none",
            parallax: {
              type: "mouse",
              origo: "slidercenter",
              speed: 2000,
              levels: [
                2, 3, 4, 5, 6, 7, 12, 16, 10, 50, 47, 48, 49, 50, 51, 55,
              ],
              type: "mouse",
            },
            shadow: 0,
            spinner: "off",
            stopLoop: "off",
            stopAfterLoops: -1,
            stopAtSlide: -1,
            shuffle: "off",
            autoHeight: "off",
            hideThumbsOnMobile: "off",
            hideSliderAtLimit: 0,
            hideCaptionAtLimit: 0,
            hideAllCaptionAtLilmit: 0,
            debugMode: false,
            fallbacks: {
              simplifyAll: "off",
              nextSlideOnWindowFocus: "off",
              disableFocusListener: false,
            },
          });
      }
    });
  });
})(jQuery);
