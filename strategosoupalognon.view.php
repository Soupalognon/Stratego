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
 * strategosoupalognon.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in strategosoupalognon_strategosoupalognon.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */
  
  require_once( APP_BASE_PATH."view/common/game.view.php" );
  
  class view_strategosoupalognon_strategosoupalognon extends game_view
  {
    function getGameName() {
        return "strategosoupalognon";
    }    
  	function build_page( $viewArgs )
  	{		
  	    // Get players & players number
        $players = $this->game->loadPlayersBasicInfos();
        $players_nbr = count( $players );

        $template = self::getGameName() . "_" . self::getGameName();
        
        $this->page->begin_block( $template, "square" );
        
        $hor_scale = 70;
        $ver_scale = 70;
        for( $x=1; $x<=10; $x++ )
        {
            for( $y=1; $y<=10; $y++ )
            {
                //Avoid lakes at the middle of the board
                if(($y == 5 || $y ==6)) {
                    if($x == 3 || $x == 4 || $x == 7 || $x == 8) {
                        continue;
                    }
                }

                $this->page->insert_block( "square", array(
                    'X' => $x,
                    'Y' => $y,
                    'LEFT' => round( ($x-1)*$hor_scale ),
                    'TOP' => round( ($y-1)*$ver_scale )
                ) );
            }        
        }
  	}
  }
  

