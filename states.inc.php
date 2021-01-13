<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * StrategoSoupalognon implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * StrategoSoupalognon game states description
 *
 */
 
$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array( "" => 2 )
    ),
    
    2 => array(
    		"name" => "initBoard",
            "description" => clienttranslate('You must place all your soldiers'),
    		"type" => "multipleactiveplayer",
    		"possibleactions" => array( "placeSoldier", "putBackOnHand" ),
    		"transitions" => array( "initBoard" => 3 )
    ),

    3 => array(
        "name" => "selectSoldier",
        "description" => clienttranslate('${actplayer} must play'),
        "descriptionmyturn" => clienttranslate('${you} must select a soldier'),
        "type" => "activeplayer",
        "possibleactions" => array( "selectSoldier" ),
        "transitions" => array( "selectSoldier" => 4 )
    ),

    4 => array(
        "name" => "moveSoldier",
        "description" => clienttranslate('${actplayer} must play'),
        "descriptionmyturn" => clienttranslate('${you} must move this soldier'),
        "type" => "activeplayer",
        "possibleactions" => array( "moveSoldier" ),
        "transitions" => array( "selectSoldier" => 3, "moveSoldier" => 10,"specialScoutAction" => 5, "endGame" => 99 )
    ),

    5 => array(
        "name" => "specialScoutAction",
        "description" => clienttranslate('${actplayer} must play'),
        "descriptionmyturn" => clienttranslate('${you} need to choose if you want to attack or end your turn'),
        "type" => "activeplayer",
        "possibleactions" => array( "moveSoldier" , "endTurnSpecialScoutAction" ),
        "transitions" => array( "moveSoldier" => 10, "endGame" => 99 )
    ),

    10 => array(
        "name" => "nextPlayer",
        "description" => "",
        "type" => "game",
        "action" => "stNextPlayer",
        "transitions" => array( "nextPlayer" => 3 )
    ),
   
    // Final state.
    // Please do not modify (and do not overload action/args methods).
    99 => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);



