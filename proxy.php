<?php
require_once('config.php');
global $neugsUrl, $neugsXMLRPCHandler;
require_once('xml_rpc.php');

function neugs_getip() {
	if ( isset($_SERVER["HTTP_CLIENT_IP"]) ) {
		return $_SERVER["HTTP_CLIENT_IP"];
	}

	if ( isset($_SERVER["HTTP_X_FORWARDED_FOR"]) ) {
		foreach (explode(",",$_SERVER["HTTP_X_FORWARDED_FOR"]) as $ip) {
		      return $ip;
		}
	}

	if ( isset($_SERVER["HTTP_X_FORWARDED"]) ) {
		return $_SERVER["HTTP_X_FORWARDED"];
	} elseif ( isset($_SERVER["HTTP_FORWARDED_FOR"]) ) {
		return $_SERVER["HTTP_FORWARDED_FOR"];
	} elseif ( isset($_SERVER["HTTP_FORWARDED"]) ) {
		return $_SERVER["HTTP_FORWARDED"];
	} elseif ( isset($_SERVER["HTTP_X_FORWARDED"]) ) {
		return $_SERVER["HTTP_X_FORWARDED"];
	} else {
		return $_SERVER["REMOTE_ADDR"];
	}
}

if( !function_exists('json_encode') ) {
	require_once('json.php');
	function json_encode( $arr ) {
		$jsoncls = new Services_JSON();
		return $jsoncls->encode($arr);
	}
	function json_decode( $str ) {
		$jsoncls = new Services_JSON();
		return $jsoncls->decode($str, true);
	}
}

//define("XMLRPC_DEBUG", 1);
if( empty($_POST['action']) || @$_POST['action'] != 'savefinaltags' ) {
	$result = XMLRPC_request($neugsUrl, $neugsXMLRPCHandler, "tags.Generate", array( 
													XMLRPC_prepare( $_POST['siteurl'] ), 
													XMLRPC_prepare( $_POST['apikey'] ), 
													XMLRPC_prepare( strip_tags($_POST['title']) ), 
													XMLRPC_prepare( strip_tags( $_POST['text']) ),
													XMLRPC_prepare( strip_tags($_POST['tags']) ), 
													XMLRPC_prepare( strip_tags($_POST['cats']) ), 
													XMLRPC_prepare( strip_tags($_POST['descr']) ), 
													XMLRPC_prepare( strip_tags($_POST['postid']) ),
													XMLRPC_prepare( neugs_getip() )
												) 
			);
		//XMLRPC_debug_print();
	echo json_encode( $result[1] );
} elseif( @$_POST['action'] == 'savefinaltags' ) {
	$result = XMLRPC_request($neugsUrl, $neugsXMLRPCHandler, "tags.SaveFinal", array( 
													XMLRPC_prepare( $_POST['siteurl'] ), 
													XMLRPC_prepare( $_POST['apikey'] ), 
													XMLRPC_prepare( strip_tags($_POST['tags']) ), 
													XMLRPC_prepare( strip_tags($_POST['request_id']) ),
													XMLRPC_prepare( neugs_getip() ) 
												) 
			);
		//XMLRPC_debug_print();
	echo json_encode( $result[1] );
}