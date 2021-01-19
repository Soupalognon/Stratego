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
 * material.inc.php
 *
 * StrategoSoupalognon game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */


$this->allSoldiers = array();

$this->allSoldiers[]  = array('type' => '0', 'name' => 'Flag', 'number_of_soldier' => 1);
$this->allSoldiers[]  = array('type' => '1', 'name' => 'Bomb', 'number_of_soldier' => 6);
$this->allSoldiers[]  = array('type' => '2', 'name' => 'Spy', 'number_of_soldier' => 1);
$this->allSoldiers[]  = array('type' => '3', 'name' => 'Scout', 'number_of_soldier' => 8);
$this->allSoldiers[]  = array('type' => '4', 'name' => 'Miner', 'number_of_soldier' => 5);
$this->allSoldiers[]  = array('type' => '5', 'name' => 'Sergent', 'number_of_soldier' => 4);
$this->allSoldiers[]  = array('type' => '6', 'name' => 'Lieutenant', 'number_of_soldier' => 4);
$this->allSoldiers[]  = array('type' => '7', 'name' => 'Captain', 'number_of_soldier' => 4);
$this->allSoldiers[]  = array('type' => '8', 'name' => 'Major', 'number_of_soldier' => 3);
$this->allSoldiers[]  = array('type' => '9', 'name' => 'Colonel', 'number_of_soldier' => 2);
$this->allSoldiers[]  = array('type' => '10', 'name' => 'General', 'number_of_soldier' => 1);
$this->allSoldiers[]  = array('type' => '11', 'name' => 'Marshal', 'number_of_soldier' => 1);

$this->FLAG = 0;
$this->BOMB = 1;
$this->SPY = 2;
$this->SCOUT = 3;
$this->MINER = 4;
$this->MARSHAL = 11;

$this->UNKNOWN_SOLDIER = 12;
$this->NO_TYPE = -1;
$this->NO_PLAYER = 0;
$this->NO_SOLIDER_ID = 0;
$this->LAKE = -1;

$this->NB_LINES = 11;    //I put 11 instead of 10 because because first line is 1 and I need to do (lines - y + 1). I put them together

$this->NO_CHEAT = 0;
$this->SPY_KILLS = 1;
$this->BOMB_KILLS = 2;