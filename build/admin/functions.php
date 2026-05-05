<?php

function ems_wp_assets()
{

  wp_register_script('bootstrap-script', 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js', array());
  wp_enqueue_script('bootstrap-script');

  //does this project require slick?
  wp_register_script('slick-script', 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js', array('jquery'));
  wp_enqueue_script('slick-script');
  wp_enqueue_style('slick-styles', 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.css');

  wp_register_script('iframe-resizer', 'https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.7/js/iframeResizer.min.js');
  wp_enqueue_script('iframe-resizer');

  wp_enqueue_style(
    '_ems-bootstrap', 
    get_stylesheet_directory_uri() . '/dist/css/bootstrap.css',
    array(), 
    filemtime(get_stylesheet_directory() . '/dist/css/bootstrap.css'), 
    'all'
  );
  // wp_enqueue_style('_ems-bootstrap', get_stylesheet_directory_uri() . '/dist/css/bootstrap.css', array(), time(), 'all');
  // wp_enqueue_style('_ems-wp-stylesheet', get_stylesheet_directory_uri() . '/dist/css/style.css', array(), time(), 'all');
  wp_enqueue_style(
      '_ems-wp-stylesheet', 
      get_stylesheet_directory_uri() . '/dist/css/style.css', 
      array(), 
      filemtime(get_stylesheet_directory() . '/dist/css/style.css'), 
      'all'
  );

  // wp_register_script('_ems-animations', get_stylesheet_directory_uri() . '/dist/js/animations.js', array('jquery', 'bootstrap-script', 'slick-script'), filemtime(get_stylesheet_directory() . '/dist/js/animations.js'), true);
  // wp_enqueue_script('_ems-animations');

  wp_register_script('_ems-wp-scripts', get_stylesheet_directory_uri() . '/dist/js/bundle.js', array('jquery', 'bootstrap-script', 'slick-script'), time(), true);
  wp_enqueue_script('_ems-wp-scripts');
  wp_enqueue_script('custom-script', get_stylesheet_directory_uri() . '/region.js', array('jquery'), filemtime(get_stylesheet_directory() . '/region.js'), false);
  wp_enqueue_script('lottie', 'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.js', array('jquery'), time(), true);

  // if ( has_block('acf/get-a-demo-style') ) {
  //     wp_dequeue_script('lottie');
  //     wp_deregister_script('lottie');

  //     wp_enqueue_style(
  //       'get-a-demo-custom-style',
  //       get_stylesheet_directory_uri() . '/custom-files/style-get-a-demoV3.min.css',
  //       array(),
  //       filemtime( get_stylesheet_directory() . '/custom-files/style-get-a-demoV3.min.css' ),
  //       'all'
  //     );


  //     wp_enqueue_script(
  //       'get-a-demo-custom-script',
  //       get_stylesheet_directory_uri() . '/custom-files/script-get-a-demoV3.min.js',
  //       array('jquery'),
  //       array(),
  //       filemtime( get_stylesheet_directory() . '/custom-files/script-get-a-demoV3.min.js' ),
  //       true
  //     );
  // }


function gp_child_enqueue_styles() {
    // Remove the default style.css if it’s automatically enqueued
    wp_dequeue_style('ems-wp');
    wp_deregister_style('ems-wp');

    // Enqueue the minified stylesheet
    wp_enqueue_style(
        'ems-wp-style-min', // unique handle
        get_stylesheet_directory_uri() . '/style.min.css',
        array('generate-style'), // depend on GeneratePress main stylesheet
        filemtime(get_stylesheet_directory() . '/style.min.css') // version for cache busting
    );
}
add_action('wp_enqueue_scripts', 'gp_child_enqueue_styles', 20);


  wp_enqueue_style(
    'notification-bar-style',
    get_stylesheet_directory_uri() . '/custom-files/notification-top-bar.css',
    array(),
    filemtime( get_stylesheet_directory() . '/custom-files/notification-top-bar.css' ),
    'all'
  );

  if (has_block('acf/get-a-demo-style')) {

    wp_dequeue_script('_ems-wp-scripts');
    wp_deregister_script('_ems-wp-scripts');
    wp_dequeue_script('lottie');
    wp_deregister_script('lottie');

    // wp_dequeue_style('_ems-wp-stylesheet');
    // wp_deregister_style('_ems-wp-stylesheet');

    if ( ! is_admin() ) {
        wp_dequeue_style( 'wp-block-editor' );
        wp_deregister_style( 'wp-block-editor' );
    }

    // wp_enqueue_style(
    //     '_ems-wp-stylesheet-optimized',
    //     get_stylesheet_directory_uri() . '/custom-files/style.min.css',
    //     array(),
    //     filemtime(get_stylesheet_directory() . '/custom-files/style.min.css'),
    //     'all'
    // );

    wp_enqueue_style(
      'get-a-demo-custom-style',
      get_stylesheet_directory_uri() . '/custom-files/style-get-a-demoV3.min.css',
      array(),
      filemtime(get_stylesheet_directory() . '/custom-files/style-get-a-demoV3.min.css'),
      'all'
    );

    wp_enqueue_script(
      'get-a-demo-custom-script',
      get_stylesheet_directory_uri() . '/custom-files/script-get-a-demoV3.min.js',
      array('jquery'),
      filemtime(get_stylesheet_directory() . '/custom-files/script-get-a-demoV3.min.js'),
      true
    );

    // Add defer attribute to the custom script
    add_filter('script_loader_tag', function($tag, $handle, $src) {
      if ('get-a-demo-custom-script' === $handle) {
        return str_replace(' src', ' defer src', $tag);
      }
      return $tag;
    }, 10, 3);

    // Preload bundle.js in the head
    add_action('wp_head', function() {
      $bundle_uri = esc_url(get_stylesheet_directory_uri() . '/dist/js/bundle.js');
      $bundle_ver = filemtime(get_stylesheet_directory() . '/dist/js/bundle.js');
      ?>
      <link rel="preload" href="<?php echo $bundle_uri; ?>?v=<?php echo $bundle_ver; ?>" as="script">
      <?php
    }, 1);

    // Lazy-load bundle.js in the footer
    add_action('wp_footer', function() {
      $bundle_uri = esc_url(get_stylesheet_directory_uri() . '/dist/js/bundle.js');
      $bundle_ver = filemtime(get_stylesheet_directory() . '/dist/js/bundle.js');
      ?>
      <script>
      document.addEventListener('DOMContentLoaded', function() {
        const target = document.querySelector('.wp-block-cover');
        if (!target) return;

        const observer = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const script = document.createElement('script');
              script.src = "<?php echo $bundle_uri; ?>?v=<?php echo $bundle_ver; ?>";
              script.defer = true;
              document.body.appendChild(script);
              observer.disconnect();
            }
          });
        }, { rootMargin: '200px' });

        observer.observe(target);
      });
      </script>
      <?php
    });
  }

  if ( has_block('acf/thank-you-style') ) {
      wp_dequeue_script('lottie');
      wp_deregister_script('lottie');

      wp_dequeue_style('_ems-wp-stylesheet');
      wp_deregister_style('_ems-wp-stylesheet');

      if ( !is_admin() ) {
          wp_dequeue_style( 'wp-block-editor' );
          wp_deregister_style( 'wp-block-editor' );
      }

      wp_enqueue_style(
        '_ems-wp-stylesheet',
        get_stylesheet_directory_uri() . '/custom-files/style.min.css',
        array(),
        filemtime(get_stylesheet_directory() . '/custom-files/style.min.css'),
        'all'
      );

      wp_enqueue_style(
        'thank-you-custom-style',
        get_stylesheet_directory_uri() . '/custom-files/style-thank-you.css',
        array(),
        filemtime( get_stylesheet_directory() . '/custom-files/style-thank-you.css' ),
        'all'
      );


      wp_enqueue_script(
        'thank-you-custom-script',
        get_stylesheet_directory_uri() . '/custom-files/script-thank-you.js',
        array('jquery'),
        filemtime( get_stylesheet_directory() . '/custom-files/script-thank-you.js' ),
        true
      );

      add_filter('script_loader_tag', function($tag, $handle, $src) {
        if ('get-a-demo-custom-script' === $handle) {
          return str_replace(' src', ' defer src', $tag);
        }
        return $tag;
      }, 10, 3);
  }


    if ( has_block('acf/pricing-page-v3-style') ) {
      wp_enqueue_style(
        'pricing-page-v3-custom-style',
        get_stylesheet_directory_uri() . '/custom-files/style-pricing-v3.css',
        array(),
        filemtime( get_stylesheet_directory() . '/custom-files/style-pricing-v3.css' ),
        'all'
      );
  }


      if ( has_block('acf/pricing-page-v2-style') ) {
      wp_enqueue_style(
        'pricing-page-v2-custom-style',
        get_stylesheet_directory_uri() . '/custom-files/style-pricing-v2.css',
        array(),
        filemtime( get_stylesheet_directory() . '/custom-files/style-pricing-v2.css' ),
        'all'
      );

      wp_enqueue_script(
        'pricing-v2-custom-script',
        get_stylesheet_directory_uri() . '/custom-files/script-pricing-v2.js',
        array('jquery'),
        filemtime( get_stylesheet_directory() . '/custom-files/script-pricing-v2.js'),
        true
      );
  }


  
  if ( has_block('acf/features-page-style-v1') ) {
      wp_enqueue_style(
        'features-page-v1-custom-style',
        get_stylesheet_directory_uri() . '/custom-files/style-features-page-v1.css',
        array(),
        filemtime( get_stylesheet_directory() . '/custom-files/style-features-page-v1.css' ),
        'all'
      );


      wp_enqueue_script(
        'features-page-v1-custom-script',
        get_stylesheet_directory_uri() . '/custom-files/script-features-page-v1.js',
        array('jquery'),
        filemtime( get_stylesheet_directory() . '/custom-files/script-features-page-v1.js' ),
        true
      );
  }

}


add_action('wp_enqueue_scripts', 'ems_wp_assets', 100);

// Inject Google Tag Manager <script> as high as possible in <head>
add_action('wp_head', function() {
    ?>
    <!-- Google Tag Manager -->
    <script>
      (function(w,d,s,l,i){w[l]=w[l]||[];
        w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
        var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),
            dl=l!='dataLayer'?'&l='+l:'';
        j.async=true;
        j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-WV4PCC2');
    </script>
    <!-- End Google Tag Manager -->
    <?php
}, 0);

// Inject Google Tag Manager <noscript> right after <body> tag
add_action('wp_body_open', function() {
    ?>
    <!-- Google Tag Manager (noscript) -->
    <noscript>
      <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WV4PCC2"
              height="0" width="0"
              style="display:none;visibility:hidden"></iframe>
    </noscript>
    <!-- End Google Tag Manager (noscript) -->
    <?php
});



// add pardot script
add_action('wp_head', 'lw_tracking_script', 20);
function lw_tracking_script()
{
  ?>
  <!-- Pardot Tracking Code -->
  <script type='text/javascript'>
    var piAId = '744343';
    var piCId = '3373';
    var piHostname = 'go-sv.linnworks.com';
    (function () {
      function async_load() {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + piHostname + '/pd.js';
        var c = document.getElementsByTagName('script')[0];
        c.parentNode.insertBefore(s, c);
      }
      if (window.attachEvent) {
        window.attachEvent('onload', async_load);
      } else {
        window.addEventListener('load', async_load, false);
      }
    })();
  </script>
  <!-- End Pardot Tracking Code -->


  <!-- Google Tag Manager -->
  <!-- <script>
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src =
        'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-WV4PCC2');
  </script> -->
  <!-- End Google Tag Manager -->

  <!-- SoPro Tracking -->
  <script>
    (function (o, u, t, b, a, s, e) {
      window[b] = window[b] || {};
      (e = e || [])['key'] = o;
      e['__obr'] = u.location.href;
      a = [];
      u.location.search.replace('?', '').split('&').forEach(function (q) {
        if (q.startsWith(b) || q.startsWith('_obid')) e[q.split('=')[0]] = q.split('=')[1];
      });
      e['_obid'] = e['_obid'] || (u.cookie.match(/(^|;)\s*_obid\s*=\s*([^;]+)/) || []).pop() || 0;
      for (k in e) {
        if (e.hasOwnProperty(k)) a.push(encodeURIComponent(k) + '=' + encodeURIComponent(e[k]));
      }
      s = u.createElement('script');
      s.src = t + '?' + a.join('&');
      u.head.appendChild(s);
    })('5b190d8c-6c7b-4c55-b2e7-bb8668cb3e7a', document, 'https://plugin.sopro.io/hq.js', 'outbase')
  </script>
  <!-- End of SoPro Tracking -->


  <meta name="facebook-domain-verification" content="h6btybt7gr4wojtca2oxy6e838pdks">
  <meta name="google-site-verification" content="0YY7_HTHkz4TPVwjVQdvNM5GrfH_GDlau8oku7H8gkg" />
  <!-- <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WV4PCC2" height="0" width="0"
      style="display:none;visibility:hidden"></iframe></noscript>
  End Google Tag Manager (noscript) -->
  <script type="text/javascript">
    // Function to load the iframe
    function loadIframe(src, target, height, download_asset) {
      //console.log('loading iframe');
      const iframe = document.createElement('iframe');
      var params = window.location.search;
      getCountryCode().then((countryCode) => {
        //console.log('country code', countryCode);
        if (!countryCode) {
          countryCode = 'US';
        }
        if (countryCode) {
          if (params.length > 0) {
            params += '&';
          } else {
            params += '?';
          }
          params += `Country_Code=${countryCode}`;
        }
        if (download_asset) {
          if (params.length > 0) {
            params += '&';
          } else {
            params += '?';
          }
          params += `Download_Asset_URL=${download_asset}`;
        }
        iframe.src = src + params;
        iframe.width = '100%';
        iframe.height = height;
        iframe.type = 'text/html';
        iframe.frameborder = '0';
        iframe.allowTransparency = 'true';
        iframe.style.border = '0';
        iframe.scrolling = 'no';
        iframe.className = 'pardot-form utm-src';
        iframe.onload = function () {
          iFrameResize({
            warningTimeout: 0
          });
        };
        // Append the iframe to a container element on your page
        const container = document.getElementById(target);
        container.appendChild(iframe);
        //console.log('iframe loaded');
      });
    }
  </script>
  <script type="text/javascript" src="https://secure.leadforensics.com/js/788122.js"></script>
  <?php
}

add_action('wp_head', 'ems_g2_script', 20);

function ems_g2_script()
{
  if (is_page() && !is_page('blog')):
    ?>
    <!-- Begin G2 Code -->
    <script type="application/ld+json">
                  {
                    "@context": "https://schema.org/",
                    "@type": "SoftwareApplication",
                    "name": "Linnworks",
                    "operatingSystem": "Web",
                    "applicationCategory": "Omnichannel Commerce,Online Marketplace Optimization Tools,Label Printing,Retail Distributed Order Management Systems,Barcode,Inventory Control,Warehouse Management,Multichannel Retail,Order Management",
                    "aggregateRating": {
                      "@context": "https://schema.org/",
                      "@type": "AggregateRating",
                      "ratingValue": 8.8,
                      "reviewCount": 51,
                      "bestRating": 10,
                      "worstRating": 0
                    },
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD"
                    }
                  }
                </script>
    <!-- End G2 Code -->
  <?php endif;
}

// admin area css
function ems_wp_admin_styles()
{
  wp_enqueue_style('admin-styles', get_stylesheet_directory_uri() . '/dist/css/admin.css', array(), filemtime(get_stylesheet_directory() . '/dist/css/admin.css'), 'all');
}
add_action('admin_enqueue_scripts', 'ems_wp_admin_styles');

add_action('wp_body_open', function () {
  echo '<noscript><img src="https://secure.leadforensics.com/788122.png" style="display:none;" /></noscript>';
}, 10);


// ACF BLOCKS
include_once 'includes/custom-blocks.php';
add_action('acf/init', 'ems_acf_init_block_types');
function ems_acf_init_block_types()
{
  // Check function exists.
  if (function_exists('acf_register_block_type')) {
    include_once 'includes/register-blocks.php';
  }
}




// HELPER FUNCTIONS
add_action('init', 'ems_wp_helper_functions');

function ems_wp_helper_functions()
{


  add_filter('body_class', 'ems_no_animate_class');
  //things that control our default blocks should go in block settings (generic)
  include_once 'includes/block-settings.php';
  //helper functions should be theme specific - anything re-usable or universal should be in this functions file
  include_once 'includes/helper-functions.php';
  //theme functions should be for this specific site, overriding or adding to the generic functions set above
  include_once 'includes/theme-functions.php';

  include_once 'includes/post-order.php';
}

add_filter('body_class', 'ems_csm_meet_body_class');
function ems_csm_meet_body_class($classes)
{
  if (is_page('csm-meet')) {
    $classes[] = 'home';
  }
  return $classes;
}

// commenting this out since it appears as if we dont need it
// because there is an element above this <header> in the dom, #primary.content-area
// which has container css rules already. if we keep this in place,
// we end up with too much padding aroudn the <header>
// add_filter( 'generate_parse_attr', function( $attributes, $context ) {
//     if ( 'entry-header' === $context ) {
//         $attributes['class'] .= ' container'; //this puts a container on general page titles
//     }

//     return $attributes;
// }, 10, 2 );

//remove all the default wordpress patterns

add_action('after_setup_theme', 'remove_patterns');
function remove_patterns()
{
  remove_theme_support('core-block-patterns');
}


/**
 * Gutenberg scripts and styles
 * @link https://www.billerickson.net/block-styles-in-gutenberg/
 */
function ems_gutenberg_scripts()
{
  wp_enqueue_script(
    'be-editor',
    get_stylesheet_directory_uri() . '/src/js/editor/blockSupports.js',
    array('wp-blocks', 'wp-dom', 'lodash'),
    filemtime(get_stylesheet_directory() . '/src/js/editor/blockSupports.js'),
    true
  );
  wp_enqueue_script(
    'block-styles',
    get_stylesheet_directory_uri() . '/src/js/editor/blockStyles.js',
    array('wp-blocks', 'wp-dom', 'be-editor'),
    filemtime(get_stylesheet_directory() . '/src/js/editor/blockStyles.js'),
    true
  );
  wp_enqueue_script(
    'block-location-restriction',
    get_stylesheet_directory_uri() . '/dist/js/blockLocationRestriction.js',
    array('wp-blocks', 'wp-dom', 'be-editor'),
    filemtime(get_stylesheet_directory() . '/dist/js/blockLocationRestriction.js'),
    true
  );
}
add_action('enqueue_block_editor_assets', 'ems_gutenberg_scripts');

if (is_admin()) {
  function ems_disable_editor_fullscreen_by_default()
  {
    $script = "jQuery( window ).load(function() { 
    const isFullscreenMode = wp.data.select( 'core/edit-post' ).isFeatureActive( 'fullscreenMode' ); 
    if ( isFullscreenMode ) { 
      wp.data.dispatch( 'core/edit-post' ).toggleFeature( 'fullscreenMode' ); 
    } 
    const isTopToolbar = wp.data.select( 'core/edit-post' ).isFeatureActive( 'fixedToolbar' ); 
    if ( !isTopToolbar ) { 
      wp.data.dispatch( 'core/edit-post' ).toggleFeature( 'fixedToolbar' ); 
    } 
    const topicField = jQuery('.acf-field-65ef94fd6bf2a');
    if (topicField.length > 0) {
      topicField.find('.acf-checkbox-list .children input').each(function() { 
        jQuery(this).on('change', function() {
          if (jQuery(this).prop('checked')) {
            const parent = jQuery(this).parents('ul.children').prev('label').find('input');
            parent.prop('checked', true);
          } 

        });
    });
    }

  });";
    wp_add_inline_script('wp-blocks', $script);
  }
  add_action('enqueue_block_editor_assets', 'ems_disable_editor_fullscreen_by_default');
}

function ems_login_logo()
{
  // prints the logo entered from "customize" admin area 
  get_template_part('template-parts/theme/login', 'logo');
}
add_action('login_enqueue_scripts', 'ems_login_logo', 10, 2);

// add footer-menu menu location
function register_footer_menu()
{
  register_nav_menu('footer-menu', __('Footer Menu'));
}
add_action('init', 'register_footer_menu');

//2023 update: acf now recommends creating a block directory
// where each block gets its own folder, render template and block.json file
// I added this block to the custom-blocks.php file so it works liek the others on the projects (preview, settings, etc) but we could talk about moving to this format. It existed when I made the other setup, but it doesn't make as much sense with our other build setup (individual stylesheets, etc)
add_action('init', 'register_acf_blocks', 5);
function register_acf_blocks()
{
  register_block_type(__DIR__ . '/blocks/inline-cta-block');
  register_block_type(__DIR__ . '/blocks/v2-recent-posts');
  register_block_type(__DIR__ . '/blocks/v2-carousel-images');
  // register_block_type(__DIR__ . '/blocks/statistics');
}

//show event date fields in events table on admin page

add_filter('manage_case-study_posts_columns', 'linnworks_filter_posts_columns');
add_filter('manage_post_posts_columns', 'linnworks_filter_posts_columns');
add_filter('manage_news_posts_columns', 'linnworks_filter_posts_columns');
add_filter('manage_guide_posts_columns', 'linnworks_filter_posts_columns');


// add_filter( 'manage_posts_columns', 'linnworks_filter_posts_columns' );

function linnworks_filter_posts_columns($columns)
{
  $columns = array(
    'cb' => $columns['cb'],
    'title' => __('Title'),
    'author' => __('Author'),
    'date' => __('Date'),
    'product_family' => __('Product'),
  );
  return $columns;
}

add_filter('manage_event_posts_columns', 'linnworks_add_author_column');
add_filter('manage_meet-the-marketplace_posts_columns', 'linnworks_add_author_column');
add_filter('manage_integration_posts_columns', 'linnworks_add_author_column');
add_filter('manage_partner_posts_columns', 'linnworks_add_author_column');
add_filter('manage_linnworks-person_posts_columns', 'linnworks_add_author_column');
add_filter('manage_testimonial_posts_columns', 'linnworks_add_author_column');
add_filter('manage_tutorial_posts_columns', 'linnworks_add_author_column');
add_filter('manage_webinar_posts_columns', 'linnworks_add_author_column');

function linnworks_add_author_column($columns)
{
  $offset = array_search('title', array_keys($columns)) + 1;
  return array_merge(array_slice($columns, 0, $offset), ['author' => __('Author')], array_slice($columns, $offset, null));
}


//add the ACF field "product_family" to the admin columns
add_action('manage_case-study_posts_custom_column', 'linnworks_event_column', 10, 2);
add_action('manage_post_posts_custom_column', 'linnworks_event_column', 10, 2);
add_action('manage_news_posts_custom_column', 'linnworks_event_column', 10, 2);
add_action('manage_guide_posts_custom_column', 'linnworks_event_column', 10, 2);


function linnworks_event_column($column, $post_id)
{
  if ('product_family' === $column) {
    $product_family_term = get_field('product_family', $post_id);
    if (!empty($product_family_term)) {
      $product_family_name = get_term($product_family_term[0]);
      echo $product_family_name->name;
    }
  }
}

function linnworks_get_region()
{
  return isset($_COOKIE['region']) ? $_COOKIE['region'] : 'US';
  // return $region;
}

function location_can_access($restriction)
{
  if ($restriction == 'unrestricted' || is_admin()) {
    return true;
  } else {
    $region = linnworks_get_region();
    if (($region == 'AU' || $region == 'NZ') && $restriction == 'restricted-au') {
      return true;
    } elseif (($region == 'AU' || $region == 'NZ' || $region == 'GB') && $restriction == 'restricted-au-eu') {
      return true;
    } elseif (($region == 'GB' || $region == 'US' || $region == 'CA') && $restriction == 'restricted-eu-us') {
      return true;
    } elseif ((($region == 'US' || $region == 'CA') && $restriction == 'restricted-us') || ($region !== 'US' && $region !== 'CA' && $restriction == 'restricted-non-us')) {
      return true;
    } else {
      return false;
    }
  }
}

function is_us()
{
  $region = linnworks_get_region();
  if ($region == 'US' || $region == 'CA') {
    return true;
  } else {
    return false;
  }
}

function linnworks_local_nav_class($classes, $item)
{
  if ($item->object == 'page') {
    $restriction = !empty(get_field('location_restriction', $item->object_id)) ? get_field('location_restriction', $item->object_id) : 'unrestricted';
    $classes[] = $restriction;
    // if (!location_can_access($restriction)) {
    //   $classes[] = 'd-none';
    // }
  }
  return $classes;
}

add_filter('nav_menu_css_class', 'linnworks_local_nav_class', 10, 2);


add_action('generate_before_header', 'linnworks_topbar', 10, null);
function linnworks_topbar()
{
  echo get_template_part('template-parts/theme/static', 'topbar');
}

add_action('generate_inside_navigation', 'ems_linn_demo_button', 10, null);
function ems_linn_demo_button()
{
  $link = get_field('demo_link', 'option');
  echo '<div class="wp-block-button is-style-button" style="order:9;"><a class="wp-block-button__link wp-element-button" href="' . $link['url'] . '" target="' . $link['target'] . '">' . $link['title'] . '</a></div>';
}



add_filter('facetwp_index_row', function ($params, $class) {
  // Combine categories into a single facet
  // $category_facets = [
  //   'guide_category',
  //   'guide_secondary_category',
  //   'case_study_category',
  //   'case_study_secondary_category',
  //   'webinar_category',
  //   'webinar_secondary_category',
  //   'blog_category',
  //   'blog_secondary_category',
  //   'news_category',
  //   'news_secondary_category',
  //   'tutorials_category',
  //   'tutorials_secondary_category',
  //   'integration_type',
  //   'partner_integration_type',
  //   'podcast_category',
  //   'podcast_secondary_category',
  // ];
  $category_facets = [
    'primary_topic',
    'additional_topics'
  ];

  if ($params['facet_name'] == 'additional_topics') {
    $term = get_term($params['term_id']);
    if ($term->parent != 0) {
      $parent = get_term($term->parent);
      $params['term_id'] = $parent->term_id;
      $params['facet_value'] = $parent->slug;
      $params['facet_display_value'] = $parent->name;
      $params['facet_name'] = 'category';
    }
    $break = true;
  }

  // if ($params['facet_name'] == 'partner_integration_type') {
  //   $params['facet_name'] = 'integration_type';
  // }

  // if ($params['facet_name'] == 'integration_type' || $params['facet_name'] == 'partner_integration_type') {
  //   $term = get_term($params['term_id']);
  //   if ($term->parent != 0) {
  //     $parent = get_term($term->parent);
  //     $params['term_id'] = $parent->term_id;
  //     $params['facet_value'] = $parent->slug;
  //     $params['facet_display_value'] = $parent->name;
  //   }
  //   $break = true;
  // }


  // Combine categories into a single facet
  $product_family_facets = [
    'guide_product_family',
    'case_study_product_family',
    'webinar_product_family',
    'blog_product_family',
    'news_product_family',
    'tutorials_product_family',
    'podcast_product_family',
  ];
  if (in_array($params['facet_name'], $product_family_facets)) {
    $params['facet_name'] = 'product_family';
  }

  if ($params['facet_name'] == 'type') {
    if ($params['facet_value'] == 'post') {
      $params['facet_display_value'] = 'Blogs';
    } else if ($params['facet_value'] == 'podcast') {
      $params['facet_display_value'] = 'Podcasts & Videos';
    }
    $break = true;
  }

  return $params;
}, 10, 2);


// exclude posts marked as exclude from site search and tier 3 integrations
add_filter('facetwp_pre_filtered_post_ids', function ($post_ids, $class) {
  if ('sitewide' == $class->template['name']) {
    $args = array(
      'post_type' => 'any',
      'posts_per_page' => -1,
      'fields' => 'ids',
      'meta_query' => array(
        'relation' => 'OR',
        array(
          'key' => 'tier',
          'value' => 'tier3',
          'compare' => '='
        ),
        array(
          'key' => 'exclude_from_search',
          'value' => '1',
          'compare' => '='
        )
      )
    );

    $posts_to_exclude = new WP_Query($args);
    if ($posts_to_exclude->have_posts()) {
      $post_ids = array_diff($post_ids, $posts_to_exclude->posts);
    }
  } else if (in_array($class->template['name'], ['resources', 'guides', 'webinars', 'blog', 'news', 'tutorials', 'integrations', 'case_studies', 'podcasts'])) {
    $args = array(
      'post_type' => 'any',
      'posts_per_page' => -1,
      'fields' => 'ids',
      'meta_query' => array(
        array(
          'key' => 'exclude_from_resource_search',
          'value' => '1',
          'compare' => '='
        )
      )
    );

    $posts_to_exclude = new WP_Query($args);
    if ($posts_to_exclude->have_posts()) {
      $post_ids = array_diff($post_ids, $posts_to_exclude->posts);
    }
  }
  return $post_ids;
}, 10, 2);

add_action('generate_after_entry_header', 'ems_add_breadcrumbs');
function ems_add_breadcrumbs()
{
  if (function_exists('yoast_breadcrumb')) {
    yoast_breadcrumb('<p id="breadcrumbs">', '</p>');
  }
}

add_action('generate_before_main_content', 'ems_notice_popup');
function ems_notice_popup()
{

  if (!empty($_GET['skuvault'])) {
    global $post;
    if (!empty($post) && $post->post_type !== 'post') {
      $content = get_field('skuvault_popup', 'option');
      echo get_template_part('template-parts/bits/modal', 'automatic', [$content, 'skuvault-modal']);
    }
  } else if (is_page()) {
    $location_restriction = get_field('location_restriction');
    if (!empty($location_restriction) && $location_restriction == 'restricted-us') {
      $content = get_field('us_only_popup', 'option');
      echo get_template_part('template-parts/bits/modal', 'automatic', [$content, 'location-modal']);
    } elseif (!empty($location_restriction) && $location_restriction == 'restricted-au') {
      $content = get_field('us_only_popup', 'option');
      $content = str_replace("North America", "Australia and New Zealand", $content);
      echo get_template_part('template-parts/bits/modal', 'automatic', [$content, 'au-location-modal']);
    } elseif (!empty($location_restriction) && $location_restriction == 'restricted-au-eu') {
      $content = get_field('us_only_popup', 'option');
      $content = str_replace("North America", "Australia, New Zealand and Europe", $content);
      echo get_template_part('template-parts/bits/modal', 'automatic', [$content, 'au-eu-location-modal']);
    } elseif (!empty($location_restriction) && $location_restriction == 'restricted-eu-us') {
      $content = get_field('us_only_popup', 'option');
      $content = str_replace("North America", "Europe and North America", $content);
      echo get_template_part('template-parts/bits/modal', 'automatic', [$content, 'eu-us-location-modal']);
    }
  }
}

// remove_action( 'generate_inside_search_modal', 'generate_do_search_fields' );
// remove_action( 'generate_inside_search_modal', 'generate_do_search_fields' );
// add_action( 'generate_inside_search_modal', 'ems_search_fields' );
/**
 * Add our search fields to the modal.
 */
add_action('init', 'add_get_val');
function add_get_val()
{
  global $wp;
  $wp->add_query_var('_search_sitewide');
}

add_shortcode('searchmodal', 'ems_search_fields');
function ems_search_fields()
{
  $search_icon = function_exists('generate_get_svg_icon') ? generate_get_svg_icon('search') : '';
  return '<form role="search" method="get" class="search-modal-form" action="' . esc_url(home_url('/')) . 'search">
		<label class="screen-reader-text">' . apply_filters('generate_search_label', _x('Search for:', 'label', 'generatepress')) . '</label>
		<div class="search-modal-fields">
			<input type="search" class="search-field" placeholder="Search" value="' . get_query_var('_search_sitewide') . '" name="_search_sitewide" />
			<button aria-label="' . esc_attr(apply_filters('generate_search_button', _x('Search', 'submit button', 'generatepress'))) . '">' . $search_icon . '</button>
		</div>
	</form>';
}
// Allow wpallimport to import svgs
add_filter('wp_all_import_image_mime_type', 'wpai_image_mime_type', 10, 2);

function wpai_image_mime_type($mime_type, $image_filepath)
{
  if (empty($mime_type) and preg_match('%\W(svg)$%i', basename($image_filepath))) {
    return 'image/svg+xml';
  }
  return $mime_type;
}

add_shortcode('super', 'super');
function super($atts, $content = null)
{
  return '<span class="supertext">' . do_shortcode($content) . '</span>';
}

add_shortcode('underline', 'ems_linn_underline');
function ems_linn_underline($atts, $content = null)
{
  return '<span class="underline hidden">' . do_shortcode($content) . '</span>';
}

add_shortcode('blue_underline', 'ems_linn_blue_underline');
function ems_linn_blue_underline($atts, $content = null)
{
  return '<span class="underline blue_underline hidden">' . do_shortcode($content) . '</span>';
}

add_shortcode('green_underline', 'ems_linn_green_underline');
function ems_linn_green_underline($atts, $content = null)
{
  return '<span class="underline green_underline hidden">' . do_shortcode($content) . '</span>';
}

add_shortcode('year', 'ems_year', 10, 2);
function ems_year()
{
  return date('Y');
}

add_shortcode('featured_resource', 'ems_featured_resource');
function ems_featured_resource()
{
  $featured_resource = get_field('featured_resource', 'option')[0];
  $type = $featured_resource->post_type;
  ob_start();
  get_template_part('template-parts/bits/search-teaser', $type, array('id' => $featured_resource->ID));
  $output = ob_get_contents();
  ob_end_clean();
  return '<div class="menu-featured-resource">' . $output . '</div>';
}

// hook block render hide gated blocks if the gate id is not in the url
add_filter('render_block', 'ems_gated_block_render', 10, 3);
function ems_gated_block_render($block_content, $block, $instance)
{
  if ($block['blockName'] === 'core/group') {
    $break = true;
    if (!empty($block['attrs']['gated']) && $block['attrs']['gated'] == 'post-gate') {
      if (!empty($_GET['gate']) && $_GET['gate'] == get_the_id()) {
        return $block_content;
      } else {
        return;
      }
    } else if (!empty($block['attrs']['gated']) && $block['attrs']['gated'] == 'pre-gate') {
      if (empty($_GET['gate']) || $_GET['gate'] != get_the_id()) {
        return $block_content;
      } else {
        return;
      }
    }
  }
  return $block_content;
}




// function redirect_category(){
//   if(is_tax('blog-category')):
//     $term = get_queried_object();
//     if(isset($term->slug)){
//       $redirect = '/blog/?_category='.$term->slug;
//       wp_redirect($redirect);
//       exit;
//     }
//   endif;
// }
// add_action('template_redirect', 'redirect_category');



function redirect_tour()
{
  if (is_singular('page')) {
    global $pagename;
    if ($pagename == 'tours') {
      if (!empty($_GET['gate']) && $_GET['gate'] == get_the_id()) {
        setcookie('tour_gate', get_the_id(), time() + (86400 * 30), '/');
      } else {
        if (!empty($_COOKIE['tour_gate'])) {
          wp_redirect(home_url('/tours/?gate=' . $_COOKIE['tour_gate']));
        }
      }
    }
  } else if (is_singular('tour')) {
    $gate = get_field('gate');
    $locked = true;
    if ($gate == 'no-gate') {
      $locked = false;
    } else {
      if ($gate == 'tour-center') {
        $gate_id = get_field('tour_center_gate_key', 'option');
      } else {
        $gate_id = get_the_id();
      }
      if (!empty($_GET['gate']) && $_GET['gate'] == $gate_id) {
        $locked = false;
      }
    }
    if ($locked) {
      wp_redirect(home_url('/tours/'));
      exit;
    }
  }
}
add_action('template_redirect', 'redirect_tour');

add_action('generate_inside_navigation', 'generate_insert_into_navigation');
function generate_insert_into_navigation()
{
  echo '<div class="searchform-toggle">
  <span class="gp-icon icon-search"><svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M6.78762 14.0729C8.37857 14.0729 9.88423 13.5288 11.0954 12.531L14.8704 16.3061C14.9997 16.4354 15.169 16.5 15.3383 16.5C15.5076 16.5 15.6769 16.4354 15.8061 16.3061C16.0646 16.0477 16.0646 15.6289 15.8061 15.3704L12.0298 11.594C14.2204 8.93031 14.0731 4.97548 11.5852 2.48774C10.3031 1.20566 8.59972 0.5 6.78643 0.5C4.97315 0.5 3.26977 1.20566 1.98771 2.48774C0.705648 3.76982 0 5.47322 0 7.28653C0 9.09984 0.705648 10.8032 1.98771 12.0853C3.26977 13.3674 4.97444 14.0731 6.78776 14.0731L6.78762 14.0729ZM2.92324 3.42318C3.95458 2.39182 5.3271 1.82317 6.7863 1.82317C8.24544 1.82317 9.61796 2.39186 10.6494 3.42318C12.7792 5.55309 12.7792 9.01934 10.6494 11.1494C9.61802 12.1808 8.24551 12.7494 6.7863 12.7494C5.32716 12.7494 3.95465 12.1807 2.92324 11.1494C1.8919 10.1181 1.32326 8.74552 1.32326 7.2863C1.32326 5.82708 1.89193 4.45589 2.92324 3.42318Z" fill="white"/>
  </svg>
  </span>
  </div>
  <div class="header-search-form-container">'
    . do_shortcode('[searchmodal]') .
    '<div class="searchform-toggle">
  <span class="gp-icon icon-search"><svg viewBox="0 0 512 512" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"><path d="M71.029 71.029c9.373-9.372 24.569-9.372 33.942 0L256 222.059l151.029-151.03c9.373-9.372 24.569-9.372 33.942 0 9.372 9.373 9.372 24.569 0 33.942L289.941 256l151.03 151.029c9.372 9.373 9.372 24.569 0 33.942-9.373 9.372-24.569 9.372-33.942 0L256 289.941l-151.029 151.03c-9.373 9.372-24.569 9.372-33.942 0-9.372-9.373-9.372-24.569 0-33.942L222.059 256 71.029 104.971c-9.372-9.373-9.372-24.569 0-33.942z"></path></svg></span>
  </div>' .
    '</div>';
}



// add_filter('generate_after_main_content', 'ems_prefooter', 2000);
function ems_prefooter()
{
  if (get_field('prefooter_type') !== 'none' || is_single()) {
    get_template_part('template-parts/theme/static', 'prefooter');
  }
}

// add_action('wp_footer', 'ems_move_prefooter');
function ems_move_prefooter()
{
  // if(!is_single() && get_post_type() !== 'webinar'):
  ?>
  <script>
    var prefooter = document.querySelector('.prefooter-container')
    if (prefooter) {
      var entry = document.querySelector('.entry-content');
      entry.appendChild(prefooter);
    }
  </script>
  <?php
  // endif;
}



// add_action('generate_inside_mobile_header', 'ems_linn_demo_button', '-1');


// add_action('generate_inside_mobile_header', 'ems_demo_button_mobile', '-1');
function ems_demo_button_mobile()
{ ?>
  <div class="wp-block-button is-style-button" style="order:9;"><a class="wp-block-button__link wp-element-button"
      href="https://linnworks.docksal.site/get-a-demo/" target="">Request a demo</a></div>

  <!-- <div class="searchform-toggle">
    <span class="gp-icon icon-search"><svg viewBox="0 0 512 512" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"><path fill-rule="evenodd" clip-rule="evenodd" d="M208 48c-88.366 0-160 71.634-160 160s71.634 160 160 160 160-71.634 160-160S296.366 48 208 48zM0 208C0 93.125 93.125 0 208 0s208 93.125 208 208c0 48.741-16.765 93.566-44.843 129.024l133.826 134.018c9.366 9.379 9.355 24.575-.025 33.941-9.379 9.366-24.575 9.355-33.941-.025L337.238 370.987C301.747 399.167 256.839 416 208 416 93.125 416 0 322.875 0 208z"></path></svg><svg viewBox="0 0 512 512" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"><path d="M71.029 71.029c9.373-9.372 24.569-9.372 33.942 0L256 222.059l151.029-151.03c9.373-9.372 24.569-9.372 33.942 0 9.372 9.373 9.372 24.569 0 33.942L289.941 256l151.03 151.029c9.372 9.373 9.372 24.569 0 33.942-9.373 9.372-24.569 9.372-33.942 0L256 289.941l-151.029 151.03c-9.373 9.372-24.569 9.372-33.942 0-9.372-9.373-9.372-24.569 0-33.942L222.059 256 71.029 104.971c-9.372-9.373-9.372-24.569 0-33.942z"></path></svg></span>
    </div> -->
  <?php
}

function filter_menu_by_location($menu_objects, $args)
{
  if (is_user_logged_in()) {
    return $menu_objects;
  }
  if ('primary' == $args->theme_location || 'footer-menu' == $args->theme_location) {
    foreach ($menu_objects as $key => $menu_object) {
      if (isset($menu_object)) {
        if (isset($menu_object->object) && $menu_object->object == 'page') {
          $id = $menu_object->object_id;
          $restriction = get_field('location_restriction', $id);
          if (!location_can_access($restriction)) {
            unset($menu_objects[$key]);
          }
        }
      }
    }
  }
  return $menu_objects;
}

//add_filter('wp_nav_menu_objects', 'filter_menu_by_location', 10, 2);






function ems_excerpt_more($more)
{
  return '...';
}
add_filter('excerpt_more', 'ems_excerpt_more', 100);

function ems_excerpt_length($length)
{
  return 20;
}
add_filter('excerpt_length', 'ems_excerpt_length', 100);


add_filter('get_the_excerpt', function ($excerpt, $post) {
  if (has_excerpt($post)) {
    $excerpt_length = apply_filters('excerpt_length', 20);
    $excerpt_more = apply_filters('excerpt_more', ' ' . '...');
    $excerpt = wp_trim_words($excerpt, $excerpt_length, $excerpt_more);
  }
  return $excerpt;
}, 10, 2);






/**
 ** displays alternate html when no posts are found
 **/
add_filter('facetwp_template_html', function ($output, $class) {
  if ($class->query->found_posts < 1) {

    // // add below if you want to output any facets from the filters
    // // change my_facet_name to the name of your facet
    if (function_exists('FWP') && isset(FWP()->facet->facets['search_sitewide'])) {
      $output = '<p>Nothing matches your search. <a style="cursor:pointer;" onclick="FWP.reset(); window.location = window.location;">Click to clear search and start over.</a></p>';
    }
    //     $keywords = FWP()->facet->facets['my_facet_name']['selected_values'];
    //     $keywords = is_array( $keywords ) ? implode( ' ', $keywords ) : $keywords;
    // }
    // if ( !empty( $keywords ) ) {
    //     $output .= ' for ' . $keywords;
    // }
  }
  return $output;
}, 10, 2);

add_filter('redirection_role', function ($role) {
  return 'wpseo_manage_options';  // Add your chosen capability or role here
});




/**
 * Add a redirect field for password protect forms when
 * HTTP_REFERER isn't set
 *
 * @access public
 * @param string $form_html
 * @return string
 */
function wpa_add__wp_http_referer($form_html)
{
  $break = true;
  if (empty($_SERVER['HTTP_REFERER'])) {
    $form_html = str_ireplace('</form>', '<input type="hidden" name="_wp_http_referer" value="' . esc_url(get_the_permalink()) . '"></form>', $form_html);
  }

  return $form_html;
}
add_filter('the_password_form', 'wpa_add__wp_http_referer', 10, 1);


add_action('wp_body_open', 'ems_notification_bar', 10, 0);
function ems_notification_bar()
{
  $id = get_the_id();
  $show_notification_bar = get_field('show_notification_bar', $id);
  if (!$show_notification_bar) {
    return;
  } else {
    get_template_part('template-parts/bits/notification-bar');
  }
}

// set dimensions on svgs using viewbox if not set explicitly
add_filter("wp_generate_attachment_metadata", "fix_wp_get_attachment_image_svg", 10, 2);
function fix_wp_get_attachment_image_svg($file, $attachment_id)
{
  $break = true;
  if (is_array($file) && preg_match('/\.svg$/i', $file['file']) && $file['width'] <= 1) {
    $svg = get_attached_file($attachment_id);
    if (($xml = simplexml_load_file($svg)) !== false) {
      $attr = $xml->attributes();
      $viewbox = explode(' ', $attr->viewBox);
      $file['width'] = isset($attr->width) && preg_match('/\d+/', $attr->width, $value) ? (int) $value[0] : (count($viewbox) == 4 ? (int) $viewbox[2] : null);
      $file['height'] = isset($attr->height) && preg_match('/\d+/', $attr->height, $value) ? (int) $value[0] : (count($viewbox) == 4 ? (int) $viewbox[3] : null);
    } else {
      $file['width'] = $file['height'] = null;
    }
  }
  return $file;
}

add_filter('wp_get_attachment_image_src', 'ems_wp_get_attachment_image_svg', 10, 4);  /* the hook */

function ems_wp_get_attachment_image_svg($image, $attachment_id, $size, $icon)
{
  if (is_array($image) && preg_match('/\.svg$/i', $image[0])) {
    if (!empty($size) && $size !== 'full') {
      // get full sized image instead
      $image = wp_get_attachment_image_src($attachment_id, 'full');
    }
  }
  return $image;
}

add_action('pum_popup_before_title', 'ems_popup_before_inner');

function ems_popup_before_inner()
{
  echo '<button type="button" class="btn-close pum-close" data-bs-dismiss="modal" aria-label="Close"></button>';
}


add_filter('acf/fields/taxonomy/query', 'linnworks_primary_topic_query', 10, 3);

function linnworks_primary_topic_query($args, $field, $post_id)
{
  $args['parent'] = 0;
  $args['exclude'] = array('1');
  return $args;
}

add_action('acf/save_post', 'linnworks_save_category_tree', 5);
function linnworks_save_category_tree($post_id)
{
  // if primary category is not in additional categories, add it
  if (isset($_POST['acf']['field_65ef94ba6bf29'])) {
    $primary = $_POST['acf']['field_65ef94ba6bf29'];
    if (!empty($primary)) {
      if (!in_array($primary, $_POST['acf']['field_65ef94fd6bf2a'])) {
        $_POST['acf']['field_65ef94fd6bf2a'][] = $primary;
      }
    }
  }

  // if a category is secondary, add its parent
  if (isset($_POST['acf']['field_65ef94fd6bf2a'])) {
    $topics = $_POST['acf']['field_65ef94fd6bf2a'];
    foreach ($topics as $topic) {
      $term = get_term($topic);
      if ($term->parent !== 0) {
        $parent = get_term($term->parent);
        if (!in_array($parent->term_id, $topics)) {
          $_POST['acf']['field_65ef94fd6bf2a'][] = $parent->term_id;
        }
      }
    }
  }

  if (isset($_POST['acf']['field_64d546f518288'])) {
    $topics = $_POST['acf']['field_64d546f518288'];
    foreach ($topics as $topic) {
      $term = get_term($topic);
      if ($term->parent !== 0) {
        $parent = get_term($term->parent);
        if (!in_array($parent->term_id, $topics)) {
          $_POST['acf']['field_64d546f518288'][] = $parent->term_id;
        }
      }
    }
  }
}

add_filter('wpseo_metabox_prio', 'lower_yoast_metabox_priority');

/**
 * Lowers the metabox priority to 'core' for Yoast SEO's metabox.
 *
 * @param string $priority The current priority.
 *
 * @return string $priority The potentially altered priority.
 */
function lower_yoast_metabox_priority($priority)
{
  return 'core';
}

function linnworks_wpr_alr_exclusions($exclusions)
{

  // Replace 'id="main-footer" with the element you'd like to exclude from the optimization. 
  // This filter matches HTML, so you have to use a portion of the HTML you want to exclude.
  // If you want to exclude more elements you can uncomment and duplicate this line: 
  // $exclusions[] = 'class="popup-builder"';

  // START editing
  $exclusions[] = 'class="site-footer"';
  //$exclusions[] = 'class="popup-builder"';
  // END editing

  return $exclusions;
}

add_filter('rocket_lrc_exclusions', 'linnworks_wpr_alr_exclusions');

function force_customizer_css()
{
  if (!is_user_logged_in()) {
    wp_enqueue_style('theme-customizer-css', get_stylesheet_uri());
  }
}
add_action('wp_enqueue_scripts', 'force_customizer_css');

function custom_change_facetwp_label_script() {
  if ( strpos( $_SERVER['REQUEST_URI'], '/resource-center/' ) !== false ) {
      ?>
      <script>
      document.addEventListener("DOMContentLoaded", function () {
          function updateInteractiveLabel() {
              const checkboxes = document.querySelectorAll(".facetwp-checkbox");
              checkboxes.forEach(function (checkbox) {
                  const value = checkbox.getAttribute("data-value");
                  if (value === "interactive") {
                      const label = checkbox.querySelector(".facetwp-display-value");
                      if (label && label.textContent.trim() === "Interactives") {
                          label.textContent = "Interactive";
                      }
                  }
              });
          }

          updateInteractiveLabel();

          // Re-run after FacetWP updates facets
          document.addEventListener('facetwp-loaded', function() {
              updateInteractiveLabel();
          });
      });
      </script>
      <?php
  }
}
add_action('wp_footer', 'custom_change_facetwp_label_script', 100);

add_action('acf/init', function () {
    if (function_exists('acf_register_block_type')) {
        acf_register_block_type([
            'name'              => 'comparison-table',
            'title'             => 'Comparison Table',
            'description'       => 'A custom comparison table block.',
            'render_template'   => 'template-parts/blocks/comparison-table.php',
            'category'          => 'formatting',
            'icon'              => 'table-col-before',
            'keywords'          => ['comparison', 'table', 'features'],
            'mode'              => 'edit',
            'supports'          => ['align' => false, 'mode' => false],
        ]);
    }
});

function print_comparison_table_script() {
    $script_url = get_stylesheet_directory_uri() . '/template-parts/blocks/comparison-table/script.js';
    $script_version = filemtime(get_stylesheet_directory() . '/template-parts/blocks/comparison-table/script.js');

    echo '<script src="' . esc_url($script_url) . '?ver=' . $script_version . '" defer></script>' . "\n";
}
add_action('wp_head', 'print_comparison_table_script', 1); 


// Register ACF Carousel Badge block
add_action('acf/init', function() {
    if( function_exists('acf_register_block_type') ) {
        acf_register_block_type([
            'name'              => 'carousel-badge',
            'title'             => __('Carousel Badge'),
            'description'       => __('A simple badge/logo carousel that scrolls from right to left.'),
            'render_template'   => 'template-parts/blocks/carousel-badge/index.php',
            'enqueue_style'     => get_stylesheet_directory_uri() . '/template-parts/blocks/carousel-badge/style.css',
            'enqueue_script'    => get_stylesheet_directory_uri() . '/template-parts/blocks/carousel-badge/script.js',
            'category'          => 'formatting',
            'icon'              => 'images-alt2',
            'keywords'          => ['carousel', 'badge', 'logo'],
            'mode'              => 'edit'
        ]);
    }
});



add_filter('wpseo_json_ld_output', function($data) {
    if (is_singular('ebook')) {  // Change 'ebook' to your CPT slug
        return false; // disable Yoast JSON-LD output on this page
    }

    if (is_singular('event')) {
        return false; 
    }

    if (is_singular('tutorial')) {
        return false; 
    }

    if (is_singular('interactive')) {
        return false; 
    }

    return $data;
});

// Add custom JSON-LD for ebook posts
add_action('wp_head', function() {
    if (!is_singular('ebook')) {
        return;
    }

    global $post;
    $page_url = get_permalink($post->ID);
    $ebook_title = get_the_title($post->ID);
    $content = strip_tags(strip_shortcodes($post->post_content));
    $ebook_description = mb_substr(trim($content), 0, 160);

    $logo_url = 'https://www.linnworks.com/wp-content/uploads/2024/12/black-linnworks-primary-logo-300x50.png'; // Replace your logo URL

    $schema = [
        '@context' => 'https://schema.org',
        '@graph' => [
            [
                '@type' => 'BreadcrumbList',
                'name' => 'Breadcrumbs',
                'itemListElement' => [
                    [
                        '@type' => 'ListItem',
                        'position' => 1,
                        'name' => 'Home',
                        'item' => home_url('/'),
                    ],
                    [
                        '@type' => 'ListItem',
                        'position' => 2,
                        'name' => 'Resources',
                        'item' => home_url('/resources'),
                    ],
                    [
                        '@type' => 'ListItem',
                        'position' => 3,
                        'name' => $ebook_title,
                        'item' => $page_url,
                    ],
                ],
            ],
            [
                '@type' => 'Book',
                '@id' => $page_url . '#book',
                'name' => $ebook_title,
                'author' => [
                    '@type' => 'Organization',
                    'name' => 'Linnworks',
                ],
                'datePublished' => get_the_date('c', $post->ID),
                'description' => $ebook_description,
                'url' => $page_url,
                'publisher' => [
                    '@type' => 'Organization',
                    'name' => 'Linnworks',
                    'logo' => [
                        '@type' => 'ImageObject',
                        'url' => $logo_url,
                    ],
                ],
                'inLanguage' => 'en',
                'isAccessibleForFree' => true,
                'bookFormat' => 'https://schema.org/EBook',
            ],
            [
                '@type' => 'WebPage',
                '@id' => $page_url . '#webpage',
                'url' => $page_url,
                'name' => $ebook_title . ' · Linnworks',
                'description' => $ebook_description,
                'inLanguage' => 'en',
                'isPartOf' => [
                    '@id' => home_url('#website'),
                ],
                'breadcrumb' => [
                    '@id' => $page_url . '#breadcrumblist',
                    'name' => 'Breadcrumbs',
                    'itemListElement' => [
                    [
                        '@type' => 'ListItem',
                        'position' => 1,
                        'name' => 'Home',
                        'item' => home_url('/'),
                    ],
                    [
                        '@type' => 'ListItem',
                        'position' => 2,
                        'name' => 'Resources',
                        'item' => home_url('/resources'),
                    ],
                    [
                        '@type' => 'ListItem',
                        'position' => 3,
                        'name' => $ebook_title,
                        'item' => $page_url,
                    ],
                  ],
                ],
            ],
            [
                '@type' => 'WebSite',
                '@id' => home_url('#website'),
                'url' => home_url('/'),
                'name' => 'Linnworks',
                'potentialAction' => [
                    '@type' => 'SearchAction',
                    'target' => home_url('/?s={search_term_string}'),
                    'query-input' => 'required name=search_term_string',
                ],
            ],
        ],
    ];

    echo '<script type="application/ld+json">' . wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>';
});


add_action('acf/init', function () {
    if (function_exists('acf_register_block_type')) {
        acf_register_block_type([
            'name'              => 'testimonial-v3',
            'title'             => 'Case Study Testimonial',
            'description'       => 'A custom testimonial swiper.',
            'render_template'   => 'template-parts/blocks/testimonial__block_v3/index.php',
            'category'          => 'formatting',
            'icon'              => 'slides',
            'enqueue_style'     => get_stylesheet_directory_uri() . '/template-parts/blocks/testimonial__block_v3/style.css',
            'enqueue_script'    => get_stylesheet_directory_uri() . '/template-parts/blocks/testimonial__block_v3/script.js',
            'keywords'          => ['testimonial', 'case', 'study'],
            'mode'              => 'edit',
            'supports'          => ['align' => false, 'mode' => false],
        ]);
    }
});

add_action('enqueue_block_assets', function () {
    if (has_block('acf/testimonial-v3')) {
        wp_enqueue_style('_2x_swiper-styles', 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css', [], '12.0.0');
        wp_enqueue_script('_2x_swiper-script', 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js', [], '12.0.0', true);
    }
});


add_action('acf/init', function () {
    if (function_exists('acf_register_block_type')) {
        acf_register_block_type([
            'name'              => 'mobile-floating-cta',
            'title'             => 'Mobile Floating CTA',
            'description'       => 'A custom mobile floating CTA for form.',
            'render_template'   => 'template-parts/blocks/mobile__floating_CTA/index.php',
            'category'          => 'formatting',
            'icon'              => 'slides',
            'enqueue_style'     => get_stylesheet_directory_uri() . '/template-parts/blocks/mobile__floating_CTA/style.css',
            'enqueue_script'    => get_stylesheet_directory_uri() . '/template-parts/blocks/mobile__floating_CTA/script.js',
            'keywords'          => ['floating', 'cta', 'mobile'],
            'mode'              => 'edit',
            'supports'          => ['align' => false, 'mode' => false],
        ]);
    }
});

// Add custom JSON-LD for event posts
add_action('wp_head', function() {
    if (!is_singular('event')) { 
        return;
    }

    global $post;
    $page_url = get_permalink($post->ID);

    
    $event_title        = get_the_title($post->ID);
    $event_start_date   = get_field('start_date', $post->ID); 
    $event_end_date     = get_field('end_date', $post->ID);
    $attendance_mode    = get_field('attendance_mode', $post->ID); 
    $event_status       = get_field('event_status', $post->ID);    
    $event_description  = wp_strip_all_tags(get_the_content(null, false, $post->ID));
    $event_image_id = get_post_thumbnail_id($post->ID);
    $event_image_url = $event_image_id ? wp_get_attachment_image_url($event_image_id, 'full') : '';
    $organizer_name     = get_field('organizer_name', $post->ID) ?: 'Linnworks';
    $organizer_url      = get_field('organizer_url', $post->ID) ?: home_url('/');
    $location_type      = get_field('location_type', $post->ID) ?: 'VirtualLocation';
    $event_location_url = get_field('event_location_url', $post->ID) ?: $page_url;
    $event_price        = get_field('event_price', $post->ID) ?: '0';
    $currency_code      = get_field('currency_code', $post->ID) ?: 'USD';
    $offer_availability = get_field('offer_availability', $post->ID) ?: 'InStock';
    $offer_valid_from   = get_field('offer_valid_from', $post->ID) ?: current_time('c');

    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Event',
        'name' => $event_title,
        'startDate' => $event_start_date,
        'endDate' => $event_end_date,
        'eventAttendanceMode' => 'https://schema.org/' . $attendance_mode,
        'eventStatus' => 'https://schema.org/' . $event_status,
        'description' => $event_description,
        'image' => [$event_image_url],
        'organizer' => [
            '@type' => 'Organization',
            'name' => $organizer_name,
            'url' => $organizer_url,
        ],
        'performer' => [
            '@type' => 'Organization',
            'name' => $organizer_name,
            'url' => $organizer_url,
        ],
        'location' => [
            '@type' => 'Place',
            'name' => $event_title,
            'url' => $event_location_url,
            'address'=> $location_type
        ],
        'offers' => [
            '@type' => 'Offer',
            'url' => $page_url,
            'price' => $event_price,
            'priceCurrency' => $currency_code,
            'availability' => 'https://schema.org/' . $offer_availability,
            'validFrom' => $offer_valid_from,
        ],
    ];

    echo '<script type="application/ld+json">' . wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>';
});

// Add custom JSON-LD for interactive posts
add_action('wp_head', function() {
    if (!is_singular('interactive')) { 
        return;
    }

    global $post;
    $page_url = get_permalink($post->ID);

    // Example fields – replace with ACF, meta, or hardcoded values
    $quiz_title        = get_the_title($post->ID);
    $quiz_description  = wp_strip_all_tags(get_the_content(null, false, $post->ID));
    $quiz_image_id = get_post_thumbnail_id($post->ID);
    $quiz_image_url  = $quiz_image_id ? wp_get_attachment_image_url($quiz_image_id, 'full') : '';
    $provider_name     = get_field('provider_name', $post->ID) ?: 'Linnworks';
    $provider_url      = get_field('provider_url', $post->ID) ?: home_url('/');
    $audience_type     = get_field('audience_type', $post->ID) ?: 'General';
    $quiz_url          = get_field('quiz_url', $post->ID) ?: $page_url;
    $cta_text          = get_field('call_to_action_text', $post->ID) ?: 'Start Quiz';

    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Quiz',
        '@id' => $page_url . '#quiz',
        'name' => $quiz_title,
        'description' => $quiz_description,
        'url' => $page_url,
        'image' => [$quiz_image_url],
        'provider' => [
            '@type' => 'Organization',
            'name' => $provider_name,
            'url' => $provider_url,
        ],
        'audience' => [
            '@type' => 'Audience',
            'audienceType' => $audience_type,
        ],
        'potentialAction' => [
            '@type' => 'InteractAction',
            'target' => $quiz_url,
            'name' => $cta_text,
        ],
    ];

    echo '<script type="application/ld+json">' . wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>';
});


// Add custom JSON-LD for team member (Person schema)
add_action('wp_head', function() {
    if (!is_singular('linnworks-person')) { 
        return;
    }

    global $post;
    $page_url = get_permalink($post->ID);

    $full_name          = get_the_title($post->ID);
    $job_title          = get_field('role', $post->ID);
    $organization_name  = get_field('organization_name', $post->ID) ?: 'Linnworks';
    $organization_url   = get_field('organization_url', $post->ID) ?: home_url('/');
    $profile_image_url  = get_the_post_thumbnail_url($post->ID, 'full');

    $social_media = get_field('social_media', $post->ID);
    $linkedin_url = $social_media['linkedin'] ?? null;
    $twitter_url  = $social_media['twitter'] ?? null;
    $bio_summary  = wp_strip_all_tags(get_the_content(null, false, $post));

    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Person',
        '@id' => $page_url . '#person',
        'name' => $full_name,
        'jobTitle' => $job_title,
        'worksFor' => [
            '@type' => 'Organization',
            'name' => $organization_name,
            'url' => $organization_url,
        ],
        'url' => $page_url,
        'image' => $profile_image_url,
        'sameAs' => array_filter([$linkedin_url, $twitter_url]),
        'description' => $bio_summary,
    ];

    echo '<script type="application/ld+json">' . wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>';
});


add_action('acf/init', function() {
    if( function_exists('acf_register_block_type') ) {
        acf_register_block_type([
            'name'              => 'get-a-demo-style',
            'title'             => 'Get a demo style',
            'description'       => 'A block that adds styles to the page',
            'icon'              => 'admin-appearance',
            'keywords'          => ['contact', 'demo'],
            'mode'              => 'edit',
            'category'          => 'formatting',
            'supports'          => [
                'mode' => false,
                'align' => false,
            ],
            'render_template'   => false,
        ]);
    }
});

add_action('acf/init', function() {
    if( function_exists('acf_register_block_type') ) {
        acf_register_block_type([
            'name'              => 'thank-you-style',
            'title'             => 'Thank You style',
            'description'       => 'A block that adds styles to the page',
            'icon'              => 'admin-appearance',
            'keywords'          => ['thank', 'you'],
            'mode'              => 'edit',
            'category'          => 'formatting',
            'supports'          => [
                'mode' => false,
                'align' => false,
            ],
            'render_template'   => false,
        ]);
    }
});

add_action('acf/init', function() {
    if( function_exists('acf_register_block_type') ) {
        acf_register_block_type([
            'name'              => 'pricing-page-v3-style',
            'title'             => 'Pricing Page v3 Style',
            'description'       => 'A block that adds styles to the page',
            'icon'              => 'admin-appearance',
            'keywords'          => ['pricing', 'v3'],
            'mode'              => 'edit',
            'category'          => 'formatting',
            'supports'          => [
                'mode' => false,
                'align' => false,
            ],
            'render_template'   => false,
        ]);
    }
});

add_action('acf/init', function() {
    if( function_exists('acf_register_block_type') ) {
        acf_register_block_type([
            'name'              => 'pricing-page-v2-style',
            'title'             => 'Pricing Page v2 Style',
            'description'       => 'A block that adds styles to the page',
            'icon'              => 'admin-appearance',
            'keywords'          => ['pricing', 'v2'],
            'mode'              => 'edit',
            'category'          => 'formatting',
            'supports'          => [
                'mode' => false,
                'align' => false,
            ],
            'render_template'   => false,
        ]);
    }
});

add_action('acf/init', function() {
    if( function_exists('acf_register_block_type') ) {
        acf_register_block_type([
            'name'              => 'features-page-style-v1',
            'title'             => 'Features Page v1 Style',
            'description'       => 'A block that adds styles to the page',
            'icon'              => 'admin-appearance',
            'keywords'          => ['features', 'v1'],
            'mode'              => 'edit',
            'category'          => 'formatting',
            'supports'          => [
                'mode' => false,
                'align' => false,
            ],
            'render_template'   => false,
        ]);
    }
});


// Add custom JSON-LD for Podcast Episode
add_action('wp_head', function() {
    if (!is_singular('podcast')) { 
        return;
    }

    global $post;
    $page_url = get_permalink($post->ID);

    $episode_description  = get_field('excerpt', $post->ID);
    $podcast_series_name  = get_field('topic', $post->ID);
    $podcast_series_url   = get_field('video', $post->ID);
    $publisher_name       = get_field('publisher_name', $post->ID);
    $publisher_url        = get_field('publisher_url', $post->ID);
    $episode_number       = get_field('episode_number', $post->ID);
    $audio_file_url       = get_field('audio_links', $post->ID);
    $duration_iso         = get_field('duration_iso', $post->ID); 
    $host_name            = get_field('host_name', $post->ID);

    $episode_title = get_the_title($post->ID);
    $publish_date  = get_the_date('c', $post->ID); 

    // Get featured image
    $featured_image_id  = get_post_thumbnail_id($post->ID);
    $featured_image_url = $featured_image_id ? wp_get_attachment_image_url($featured_image_id, 'full') : '';
    $featured_image_meta = $featured_image_id ? wp_get_attachment_metadata($featured_image_id) : null;

    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'PodcastEpisode',
        '@id'   => $page_url . '#episode',
        'url'   => $page_url,
        'name'  => $episode_title,
        'description'   => $episode_description,
        'datePublished' => $publish_date,
        'partOfSeries'  => [
            '@type' => 'PodcastSeries',
            'name'  => $podcast_series_name,
            'url'   => $podcast_series_url,
            'publisher' => [
                '@type' => 'Organization',
                'name'  => $publisher_name,
                'url'   => $publisher_url,
            ],
        ],
        'episodeNumber' => $episode_number ? (int) $episode_number : null,
        'associatedMedia' => [
            '@type' => 'AudioObject',
            'contentUrl' => $audio_file_url,
            'encodingFormat' => 'audio/mpeg',
        ],
        'image' => $featured_image_url ? [
            '@type' => 'ImageObject',
            'url' => $featured_image_url,
            'width' => isset($featured_image_meta['width']) ? $featured_image_meta['width'] : null,
            'height' => isset($featured_image_meta['height']) ? $featured_image_meta['height'] : null,
        ] : null,
        'duration' => $duration_iso,
        'author'   => [
            '@type' => 'Person',
            'name'  => $host_name,
        ],
    ];

    $schema = array_filter($schema, function($value) {
        return !is_null($value) && $value !== '';
    });

    echo '<script type="application/ld+json">' . wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>';
});



// Add JSON-LD schema for Tutorial posts (Course / CourseInstance / VideoObject)
add_action('wp_head', function () {
  if (!is_singular('tutorial')) {
    return;
  }

  global $post;

  // Core and fallback values
  $page_url      = get_permalink($post->ID);
  $publish_date  = get_the_date('c', $post->ID);
  $module_title  = get_the_title($post->ID);
  $yoast_description = get_post_meta($post->ID, '_yoast_wpseo_metadesc', true);
  $module_description = get_field('excerpt', $post->ID) ?: wp_strip_all_tags(strip_shortcodes($post->post_content)) ?: $yoast_description;

  // Series / Course data
  $series_url   = get_field('series_url', $post->ID) ?: get_field('series_url', 'option') ?: home_url('/');
  $series_name  = get_field('series_name', $post->ID) ?: get_bloginfo('name') . ' Tutorials';
  $series_description = get_field('series_description', $post->ID) ?: $module_description;

  // Provider / Organization
  $provider_name = get_field('provider_name', 'option') ?: get_bloginfo('name');
  $provider_url  = get_field('provider_url', 'option') ?: home_url('/');
  $provider_logo_url = get_field('provider_logo_url', 'option') ?: get_stylesheet_directory_uri() . '/assets/logo.png';

  // Instructor
  $instructor_name = get_field('instructor_name', $post->ID) ?: get_field('instructor', $post->ID) ?: '';

  // Image handling
  $teaser = get_field('teaser_image', $post->ID);
  if (is_array($teaser) && !empty($teaser['url'])) {
    $thumbnail_url = $teaser['url'];
  } elseif (is_numeric($teaser)) {
    $thumbnail_url = wp_get_attachment_image_url((int) $teaser, 'full') ?: '';
  } elseif (is_string($teaser) && filter_var($teaser, FILTER_VALIDATE_URL)) {
    $thumbnail_url = $teaser;
  } else {
    $thumbnail_url = get_the_post_thumbnail_url($post->ID, 'full') ?: '';
  }

  // Video handling
  $video_embed_url = get_field('video_embed_url', $post->ID) ?: get_field('video', $post->ID) ?: '';
  $video_duration_iso = get_field('video_duration_iso', $post->ID) ?: '';

  $schema = [
    '@context' => 'https://schema.org',
    '@graph' => [
      [
        '@type' => 'Course',
        '@id' => $series_url . '#course',
        'name' => $series_name,
        'description' => $series_description,
        'provider' => [
          '@type' => 'Organization',
          'name' => $provider_name,
          'url'  => $provider_url,
          'logo' => [
            '@type' => 'ImageObject',
            'url' => $provider_logo_url,
          ],
        ],
        'hasCourseInstance' => [
          '@type' => 'CourseInstance',
          '@id' => $page_url . '#courseInstance',
          'name' => $module_title,
          'description' => $module_description,
          'url' => $page_url,
          'courseMode' => 'online',
          'startDate' => $publish_date,
          'instructor' => [
            '@type' => 'Person',
            'name' => $instructor_name,
          ],
        ],
      ],
      [
        '@type' => 'VideoObject',
        '@id' => $page_url . '#video',
        'name' => $module_title,
        'description' => $module_description,
        'thumbnailUrl' => $thumbnail_url,
        'uploadDate' => $publish_date,
        'embedUrl' => $video_embed_url,
        'contentUrl' => $page_url,
        'publisher' => [
          '@type' => 'Organization',
          'name' => $provider_name,
          'logo' => [
            '@type' => 'ImageObject',
            'url' => $provider_logo_url,
            'width' => 200,
            'height' => 60,
          ],
        ],
        'duration' => $video_duration_iso,
        'learningResourceType' => 'Tutorial',
      ],
    ],
  ];

  echo '<script type="application/ld+json">' .
       wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) .
       '</script>' . "\n";
});



add_filter('posts_orderby', function($orderby, $query) {
  global $wpdb;
  
  // Only for frontend queries with post types
  if (is_admin() || empty($query->query_vars['post_type'])) {
    return $orderby;
  }
  
  $post_types = (array) $query->query_vars['post_type'];
  
  // Check if this is the resources query (has all these post types)
  $is_resources = in_array('webinar', $post_types) && 
                  in_array('case-study', $post_types) && 
                  in_array('guide', $post_types);
  
  if ($is_resources) {
    $orderby = "CASE 
      WHEN {$wpdb->posts}.post_type = 'webinar' 
      THEN COALESCE(
        (SELECT STR_TO_DATE(meta_value, '%Y%m%d') FROM {$wpdb->postmeta} WHERE post_id = {$wpdb->posts}.ID AND meta_key = 'webinar_date' LIMIT 1),
        {$wpdb->posts}.post_date
      )
      ELSE {$wpdb->posts}.post_date 
    END DESC";
  }
  
  return $orderby;
}, 999, 2);