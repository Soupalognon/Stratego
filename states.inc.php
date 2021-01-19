<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * StrategoSoupalognon implementation : © Gabriel Durand <gabriel.durand@hotmail.fr>
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
        "transitions" => array( "" => 10 )
    ),
    
    2 => array(
    		"name" => "initBoard",
            "description" => clienttranslate('You must place all your soldiers'),
    		"type" => "multipleactiveplayer",
    		"possibleactions" => array( "placeSoldier", "putBackOnHand" ),
    		"transitions" => array( "initBoard" => 4 )
    ),

    4 => array(
        "name" => "endInitBoard",
        "description" => "",
        "type" => "game",
        "action" => "stEndInitBoard",
        "transitions" => array( "endInitBoard" => 10 )
    ),

    10 => array(
        "name" => "selectSoldier",
        "description" => clienttranslate('${actplayer} must play'),
        "descriptionmyturn" => clienttranslate('${you} must select a soldier'),
        "type" => "activeplayer",
        "possibleactions" => array( "selectSoldier" ),
        "transitions" => array( "selectSoldier" => 12 )
    ),

    12 => array(
        "name" => "moveSoldier",
        "description" => clienttranslate('${actplayer} must play'),
        "descriptionmyturn" => clienttranslate('${you} must move this soldier'),
        "type" => "activeplayer",
        "possibleactions" => array( "moveSoldier" ),
        "transitions" => array( "selectSoldier" => 10, "moveSoldier" => 20, "specialScoutAction" => 14, "endGame" => 99 )
    ),

    14 => array(
        "name" => "specialScoutAction",
        "description" => clienttranslate('${actplayer} must play'),
        "descriptionmyturn" => clienttranslate('${you} need to choose if you want to attack or end your turn'),
        "type" => "activeplayer",
        "possibleactions" => array( "moveSoldier" , "endTurnSpecialScoutAction" ),
        "transitions" => array( "moveSoldier" => 20, "endGame" => 99 )
    ),

    20 => array(
        "name" => "nextPlayer",
        "description" => "",
        "type" => "game",
        "action" => "stNextPlayer",
        "transitions" => array( "nextPlayer" => 10, "endGame" => 99 )
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



