<?php
/**
 * @package Neugs
 * @author Neural Brothers
 * @version 9.5
 */
/*
Plugin Name: Neugs
Plugin URI: http://neuralbrothers.com/
Description: Neugs extracts the essence of your text and automatically suggests possible tags. Your blog posts are analysed by a remote intelligent engine and the results are returned to you via our API. The Neugs system learns, its accuracy increases gradually. The more you use it, the more accurate its tag suggestions become. Soon you will no longer have to tag anything on your own.
Author: Neural Brothers
Version: 9.5
Author URI: http://neuralbrothers.com/
*/
require_once('config.php');


//TODO: some method to communicate with the user. Probably add settings option
function neugs_activation() {
	global $neugsUrl, $neugsXMLRPCHandler;
	require_once('xml_rpc.php');
	$apikey = get_option('neugs_apikey');
	$siteurl = get_option('siteurl');
	$sitetitle = get_option('blogname');
	
	if( empty( $apikey ) ) {
		$result = XMLRPC_request($neugsUrl, $neugsXMLRPCHandler, "account.Register", array( XMLRPC_prepare( $siteurl ), XMLRPC_prepare( $sitetitle ) ) );
		if( $result[0] ) {
			add_option('neugs_apikey', $result[1], '');
			add_option('neugs_status', 'active', '');
		} 
	} else {
		
		$result = XMLRPC_request($neugsUrl, $neugsXMLRPCHandler, "account.CheckStatus", array( XMLRPC_prepare( $siteurl ), XMLRPC_prepare( $apikey ), XMLRPC_prepare( $sitetitle ) ) );
		switch($result[1]['status']) {
			case 'disabled' :
				//TODO:
				update_option('neugs_status', 'disabled', '');
				update_option('neugs_apikey', $result[1]['key']);
				break;
			case 'invalidkey' :
				update_option('neugs_apikey', $result[1]['key']);
				update_option('neugs_status', 'active', '');
				break;
			case 'allesok' :
				update_option('neugs_apikey', $result[1]['key']);
				update_option('neugs_status', 'active', '');
				break;
		}
		//if( $result[0] ) add_option('neugs_apikey', $result[1], '');
	}
}

register_activation_hook( __FILE__, 'neugs_activation' );

function neugs_headerfiles(){
	
	$pluginUrl = WP_CONTENT_URL.'/plugins/'.plugin_basename(dirname(__FILE__));
	$on_write_page = (preg_match("/\/post/", $_SERVER['PHP_SELF']) && preg_match("/action=edit/", $_SERVER['QUERY_STRING'])) || preg_match("/\/post-new/", $_SERVER['PHP_SELF']);
	$siteurl = get_option('siteurl');
	if( $on_write_page ) {
		if( preg_match("/action=edit/", $_SERVER['QUERY_STRING']) ) $postId = attribute_escape($_GET['post']);
		else $postId = 0;
		echo "\n" . '<link rel="stylesheet" type="text/css" href="' . $pluginUrl . '/neugs.css" />' . "\n";
		echo ' <style type="text/css">
				#neugs_generatedtags span a {
					background:transparent url("'.$siteurl.'/wp-content/plugins/neugs-intelligent-tagger/arrows.gif") no-repeat scroll 0% 0%;
				}
				#neugs_generatedtags span a:hover {
					background:transparent url("'.$siteurl.'/wp-content/plugins/neugs-intelligent-tagger/arrows.gif") no-repeat scroll 0px -11px;
				}
				</style> '."\n";
		echo "<script type='text/javascript' > 
				var postId = $postId;
				var neugsApiKey = '".get_option('neugs_apikey')."'; 
				var neugsProxyUrl = '".$pluginUrl."/proxy.php';
				var neugsSiteUrl = '".get_option('siteurl')."';
				</script>\n";	
		echo "<script type='text/javascript' src='".$pluginUrl."/neugs.js'></script>\n";
	} else {
		
	}
	
}
add_action('admin_head', 'neugs_headerfiles');

// configration pages

// add_action('admin_menu', 'neugs_config_page');

// function neugs_config_page() {
//	if ( function_exists('add_submenu_page') )
//		add_submenu_page('plugins.php', __('Neugs Configuration'), __('Neugs Configuration'), 'manage_options', 'neugs-key-config', 'neugs_conf');

// }

function neugs_conf() {
	global $neugsUrl, $neugsXMLRPCHandler;
	require_once('xml_rpc.php');
	
	
	//define('XMLRPC_DEBUG_INFO', 1);
	
	if ( !empty($_POST['neugs_pluginformaction']) ) {
		if ( function_exists('current_user_can') && !current_user_can('manage_options') )
			die(__('Cheatin&#8217; uh?'));

		check_admin_referer( );
		
		switch( $_POST['neugs_pluginformaction'] ) {
			case 'renewapikey' :
				$apikey = get_option('neugs_apikey');
				$siteurl = get_option('siteurl');
				$result = XMLRPC_request($neugsUrl, $neugsXMLRPCHandler, "account.CheckStatus", array( XMLRPC_prepare( $siteurl ), 
																								XMLRPC_prepare( $apikey ) ) );
				switch($result[1]['status']) {
					case 'disabled' :
						update_option('neugs_status', 'disabled', '');
						update_option('neugs_apikey', $result[1]['key']);
						break;
					case 'invalidkey' :
						update_option('neugs_apikey', $result[1]['key'], '');
						update_option('neugs_status', 'active', '');
						break;
					case 'allesok' :
						update_option('neugs_apikey', $result[1]['key']);
						update_option('neugs_status', 'active', '');
						break;
				}
				break;			
		}
		
	}
	$apikey = get_option('neugs_apikey');
	$siteurl = get_option('siteurl');
	$result = XMLRPC_request($neugsUrl, $neugsXMLRPCHandler, "account.CheckStatusOnly", array( XMLRPC_prepare( $siteurl ), 
																								XMLRPC_prepare( $apikey ) ) );

	$status = '';
	
	switch($result[1]['status']) {
		case 'disabled' :
			//TODO:
			update_option('neugs_status', 'disabled', '');
			update_option('neugs_apikey', $result[1]['key']);
			$status = 'Your accont has been disabled. Contact the Neugs owners for more information!';
			break;
		case 'invalidkey' :
			update_option('neugs_apikey', $result[1]['key']);
			update_option('neugs_status', 'active', '');
			$status = 'Your current key was invalid!';
			break;
		case 'allesok' :
			update_option('neugs_apikey', $result[1]['key']);
			update_option('neugs_status', 'active', '');
			$status = 'Your account is active and working!';
			break;
		case 'notexisting' :
			update_option('neugs_apikey', $result[1]['key']);
			update_option('neugs_status', 'active', '');
			$status = 'You do not have an account, try deactivating and activating the plugin!';
			break;
	}
	

?>
<?php if ( !empty($_POST ) ) : ?>
<div id="message" class="updated fade"><p><strong><?php _e('Options saved.') ?></strong></p></div>
<?php endif; ?>
<div class="wrap">
<h2><?php _e('Neugs Configuration'); ?></h2>
<div class="narrow">
<form action="" method="post" id="neugs-conf" style="margin: auto; width: 400px; ">

	<p><?php printf( _e('Neugs intro text ') ); ?></p>


<h3><label for="key"><?php _e(' Neugs Status'); ?>: </label></h3>

<?php

	switch($result[1]['status']) {
		case 'disabled' :
			//TODO:
			update_option('neugs_status', 'disabled', '');
			update_option('neugs_apikey', $result[1]['key']);
			?> <h3><label for="key"><?php _e($status); ?> </label></h3> <?php 
			break;
		case 'invalidkey' :
			update_option('neugs_apikey', $result[1]['key']);
			update_option('neugs_status', 'active', '');
			?> <h3><label for="key"><?php _e($status); ?> </label></h3>
				<input type="hidden" name="neugs_pluginformaction" value="renewapikey" />
				<p class="submit"><input type="submit" name="submit" value="<?php _e('Get active key!'); ?>" /></p> 
			<?php
			break;
		case 'allesok' :
			update_option('neugs_apikey', $result[1]['key']);
			update_option('neugs_status', 'active', '');
			?> <h3><label for="key"><?php _e($status); ?> </label></h3> <?php 
			break;
		case 'notexisting' :
			update_option('neugs_apikey', $result[1]['key']);
			update_option('neugs_status', 'active', '');
			
			?> <h3><label for="key"><?php _e($status); ?> </label></h3> <?php 
			break;
	} 
?>



</form>
</div>
</div>
<?php
}
