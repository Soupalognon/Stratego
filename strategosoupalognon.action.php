<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * StrategoSoupalognon implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * strategosoupalognon.action.php
 *
 * StrategoSoupalognon main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/strategosoupalognon/strategosoupalognon/myAction.html", ...)
 *
 */
  
  
  class action_strategosoupalognon extends APP_GameAction
  { 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "strategosoupalognon_strategosoupalognon";
            self::trace( "Complete reinitialization of board game" );
      }
    } 

    public function putBackOnHand() {
      self::setAjaxMode();
      
      $x = self::getArg("x", AT_posint, true);
      $y = self::getArg("y", AT_posint, true);
      $player_id = self::getArg("player_id", AT_posint, true);

      $this->game->putBackOnHand($x, $y, $player_id);
      self::ajaxResponse();
    }
    
    public function placeSoldier() {
      self::setAjaxMode();
      
      $soldier_id = self::getArg("soldier_id", AT_posint, true);
      $type = self::getArg("type", AT_posint, true);
      $x = self::getArg("x", AT_posint, true);
      $y = self::getArg("y", AT_posint, true);
      $player_id = self::getArg("player_id", AT_posint, true);
      
      $this->game->placeSoldier($x, $y, $soldier_id, $type, $player_id);
      self::ajaxResponse();
    }

    public function selectSoldier() {
      self::setAjaxMode();

      $x = self::getArg("x", AT_posint, true);
      $y = self::getArg("y", AT_posint, true);
      
      $this->game->selectSoldier($x, $y);
      self::ajaxResponse();
    }

    public function moveSoldier() {
      self::setAjaxMode();

      $x = self::getArg("x", AT_posint, true);
      $y = self::getArg("y", AT_posint, true);
      
      $this->game->moveSoldier($x, $y);
      self::ajaxResponse();
    }

    public function specialScoutAction() {
      self::setAjaxMode();

      $x = self::getArg("x", AT_posint, true);
      $y = self::getArg("y", AT_posint, true);
      
      $this->game->moveSoldier($x, $y);
      self::ajaxResponse();
    }

    public function endTurnSpecialScoutAction() {
      self::setAjaxMode();

      $this->game->endTurnSpecialScoutAction();
      self::ajaxResponse();
    }
  }
  

