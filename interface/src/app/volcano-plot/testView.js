angular.module('adage.volcano-plot.testView', [
  'ui.router',
  'adage.analyze.sampleBin',
  'adage.volcano-plot'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('vptest', {
    url: '/vptest',
    views: {
      main: {
        templateUrl: 'volcano-plot/testView.tpl.html',
        controller: 'VolcanoPlotTestCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Volcano Plot test view'}
  });
}])

.controller('VolcanoPlotTestCtrl', ['SampleBin', '$stateParams',
  // TODO make use of $stateParams (hard coded for initial tests)
  function VolcanoPlotTestCtrl(SampleBin, $stateParams) {
    // give our templates a way to access the SampleBin service
    this.sb = SampleBin;

    this.data = [
      {
        "logsig": 1.660176558223366,
        "node": "Node1pos",
        "diff": -0.00460211823668007
      },
      {
        "logsig": 0,
        "node": "Node2pos",
        "diff": -0.0007672126006032464
      },
      {
        "logsig": 0,
        "node": "Node3pos",
        "diff": 0.006316412190489835
      },
      {
        "logsig": 0,
        "node": "Node4pos",
        "diff": 0.0019315433700373922
      },
      {
        "logsig": 0,
        "node": "Node5pos",
        "diff": -0.006705646821418268
      },
      {
        "logsig": 0.5426815091412629,
        "node": "Node6pos",
        "diff": 0.004850694770907525
      },
      {
        "logsig": 0,
        "node": "Node7pos",
        "diff": 0.0014096414020854685
      },
      {
        "logsig": 0,
        "node": "Node8pos",
        "diff": 0.004841241065809175
      },
      {
        "logsig": 4.514732793648281,
        "node": "Node9pos",
        "diff": -0.012917727194113032
      },
      {
        "logsig": 0,
        "node": "Node10pos",
        "diff": 0.0002908458263845835
      },
      {
        "logsig": 0,
        "node": "Node11pos",
        "diff": -0.0018043760869180688
      },
      {
        "logsig": 0.9371070437321216,
        "node": "Node12pos",
        "diff": 0.007692705925583655
      },
      {
        "logsig": 0,
        "node": "Node13pos",
        "diff": -0.0006246661118645713
      },
      {
        "logsig": 0,
        "node": "Node14pos",
        "diff": 0.00381754338804399
      },
      {
        "logsig": 0,
        "node": "Node15pos",
        "diff": 0.004477851009849545
      },
      {
        "logsig": 2.8565008223263724,
        "node": "Node16pos",
        "diff": 0.006501929972463197
      },
      {
        "logsig": 0.07092214666616423,
        "node": "Node17pos",
        "diff": 0.003078670452732476
      },
      {
        "logsig": 0,
        "node": "Node18pos",
        "diff": 0.002457483194661253
      },
      {
        "logsig": 0,
        "node": "Node19pos",
        "diff": -0.000042851053620353885
      },
      {
        "logsig": 0,
        "node": "Node20pos",
        "diff": -0.0006699687110546509
      },
      {
        "logsig": 0.03061576555588015,
        "node": "Node21pos",
        "diff": 0.002096504852448521
      },
      {
        "logsig": 0,
        "node": "Node22pos",
        "diff": -0.001680362269198602
      },
      {
        "logsig": 1.3796376140487232,
        "node": "Node23pos",
        "diff": 0.00473318230855478
      },
      {
        "logsig": 0.43071664665577136,
        "node": "Node24pos",
        "diff": -0.002709286753773197
      },
      {
        "logsig": 0,
        "node": "Node25pos",
        "diff": 0.0008225317510532949
      },
      {
        "logsig": 0,
        "node": "Node26pos",
        "diff": -0.002141075997726451
      },
      {
        "logsig": 0,
        "node": "Node27pos",
        "diff": -0.003517306265512632
      },
      {
        "logsig": 0,
        "node": "Node28pos",
        "diff": -0.003375609651822231
      },
      {
        "logsig": 0,
        "node": "Node29pos",
        "diff": -0.005840172881936027
      },
      {
        "logsig": 1.0225819547246957,
        "node": "Node30pos",
        "diff": -0.004921739166579541
      },
      {
        "logsig": 4.444191809699062,
        "node": "Node31pos",
        "diff": 0.020565942243240563
      },
      {
        "logsig": 1.6237915868323278,
        "node": "Node32pos",
        "diff": -0.004929860630362022
      },
      {
        "logsig": 0,
        "node": "Node33pos",
        "diff": -0.002983796866764372
      },
      {
        "logsig": 4.1314434878043755,
        "node": "Node34pos",
        "diff": 0.011434438905607705
      },
      {
        "logsig": 6.675728956227172,
        "node": "Node35pos",
        "diff": -0.04996363939193545
      },
      {
        "logsig": 0,
        "node": "Node36pos",
        "diff": -0.0008212844637881754
      },
      {
        "logsig": 0,
        "node": "Node37pos",
        "diff": 0.00000837563391373122
      },
      {
        "logsig": 6.2146790415071935,
        "node": "Node38pos",
        "diff": -0.019284316383095832
      },
      {
        "logsig": 3.0709007914248283,
        "node": "Node39pos",
        "diff": 0.006707115455519844
      },
      {
        "logsig": 0,
        "node": "Node40pos",
        "diff": 0.00014831425183658571
      },
      {
        "logsig": 3.509287143114143,
        "node": "Node41pos",
        "diff": 0.007655631238312495
      },
      {
        "logsig": 0,
        "node": "Node42pos",
        "diff": 0.00164342185359842
      },
      {
        "logsig": 1.6763392804039017,
        "node": "Node43pos",
        "diff": 0.005921142985040779
      },
      {
        "logsig": 0,
        "node": "Node44pos",
        "diff": -0.0012912978122587274
      },
      {
        "logsig": 0,
        "node": "Node45pos",
        "diff": 0.0024470587744226673
      },
      {
        "logsig": 0,
        "node": "Node46pos",
        "diff": -0.0010090527728523534
      },
      {
        "logsig": 0,
        "node": "Node47pos",
        "diff": 0.0014241962311703788
      },
      {
        "logsig": 0,
        "node": "Node48pos",
        "diff": 0.0012873819810564804
      },
      {
        "logsig": 2.3807274327317023,
        "node": "Node49pos",
        "diff": 0.00947632191003862
      },
      {
        "logsig": 3.1666188351058397,
        "node": "Node50pos",
        "diff": 0.007202872850597123
      },
      {
        "logsig": 0,
        "node": "Node51pos",
        "diff": -0.00045203469835637195
      },
      {
        "logsig": 0,
        "node": "Node52pos",
        "diff": 0.000693876831701658
      },
      {
        "logsig": 0,
        "node": "Node53pos",
        "diff": 0.008043887283247312
      },
      {
        "logsig": 0,
        "node": "Node54pos",
        "diff": 0.00005152177765651788
      },
      {
        "logsig": 0,
        "node": "Node55pos",
        "diff": -0.006610448196701146
      },
      {
        "logsig": 0,
        "node": "Node56pos",
        "diff": 0.0011276019713906075
      },
      {
        "logsig": 0.034834216379172785,
        "node": "Node57pos",
        "diff": -0.006531914998813955
      },
      {
        "logsig": 0,
        "node": "Node58pos",
        "diff": -0.005892508079098307
      },
      {
        "logsig": 0,
        "node": "Node59pos",
        "diff": 0.00034731490235328616
      },
      {
        "logsig": 0,
        "node": "Node60pos",
        "diff": 0.0045905854456299786
      },
      {
        "logsig": 1.5747984380940032,
        "node": "Node61pos",
        "diff": -0.007535733847375792
      },
      {
        "logsig": 0,
        "node": "Node62pos",
        "diff": 0.000007000932113968367
      },
      {
        "logsig": 0,
        "node": "Node63pos",
        "diff": 0.0006293845125790443
      },
      {
        "logsig": 0,
        "node": "Node64pos",
        "diff": 0.0003665707418543639
      },
      {
        "logsig": 0,
        "node": "Node65pos",
        "diff": 0.0005325550609670644
      },
      {
        "logsig": 1.0327618796751796,
        "node": "Node66pos",
        "diff": 0.0178910618846731
      },
      {
        "logsig": 5.5805508460444155,
        "node": "Node67pos",
        "diff": -0.020601626307592942
      },
      {
        "logsig": 0,
        "node": "Node68pos",
        "diff": -0.00013776968516926276
      },
      {
        "logsig": 0,
        "node": "Node69pos",
        "diff": 0.0018852926286067671
      },
      {
        "logsig": 0,
        "node": "Node70pos",
        "diff": -0.000563481272183666
      },
      {
        "logsig": 1.018928603274078,
        "node": "Node71pos",
        "diff": -0.004170019215491262
      },
      {
        "logsig": 0.21880365216653289,
        "node": "Node72pos",
        "diff": -0.0036466573619769603
      },
      {
        "logsig": 0.7528821896615665,
        "node": "Node73pos",
        "diff": -0.0037784553360328634
      },
      {
        "logsig": 0,
        "node": "Node74pos",
        "diff": -0.002802970147997571
      },
      {
        "logsig": 0,
        "node": "Node75pos",
        "diff": -0.0017000488682845595
      },
      {
        "logsig": 0,
        "node": "Node76pos",
        "diff": 0.00804631659211968
      },
      {
        "logsig": 0.1954496965164075,
        "node": "Node77pos",
        "diff": -0.002980795044137873
      },
      {
        "logsig": 0,
        "node": "Node78pos",
        "diff": -0.002236820707518085
      },
      {
        "logsig": 0,
        "node": "Node79pos",
        "diff": -0.0001777783643419248
      },
      {
        "logsig": 0,
        "node": "Node80pos",
        "diff": -0.0011146892800621977
      },
      {
        "logsig": 0,
        "node": "Node81pos",
        "diff": -0.0000961710735178825
      },
      {
        "logsig": 0,
        "node": "Node82pos",
        "diff": 0.0009796521438483646
      },
      {
        "logsig": 0,
        "node": "Node83pos",
        "diff": 0.000572238428631049
      },
      {
        "logsig": 0,
        "node": "Node84pos",
        "diff": -0.00010660990772932977
      },
      {
        "logsig": 0,
        "node": "Node85pos",
        "diff": -0.0024920105435015604
      },
      {
        "logsig": 0,
        "node": "Node86pos",
        "diff": -0.0009591314293379974
      },
      {
        "logsig": 0,
        "node": "Node87pos",
        "diff": 0.0002645002356961528
      },
      {
        "logsig": 0,
        "node": "Node88pos",
        "diff": 0.001323683415459804
      },
      {
        "logsig": 0,
        "node": "Node89pos",
        "diff": -0.0009746948893332351
      },
      {
        "logsig": 0,
        "node": "Node90pos",
        "diff": 0.002542897269583801
      },
      {
        "logsig": 0,
        "node": "Node91pos",
        "diff": -0.0016639214393138597
      },
      {
        "logsig": 0.08383905255899485,
        "node": "Node92pos",
        "diff": 0.002213178440079856
      },
      {
        "logsig": 0,
        "node": "Node93pos",
        "diff": -0.00043339130461906363
      },
      {
        "logsig": 0,
        "node": "Node94pos",
        "diff": -0.0009161570718001096
      },
      {
        "logsig": 0,
        "node": "Node95pos",
        "diff": 0.007417160848800544
      },
      {
        "logsig": 0,
        "node": "Node96pos",
        "diff": 0.01070060096064942
      },
      {
        "logsig": 0,
        "node": "Node97pos",
        "diff": 0.0017032106228702954
      },
      {
        "logsig": 0,
        "node": "Node98pos",
        "diff": -0.00011807154700912417
      },
      {
        "logsig": 0,
        "node": "Node99pos",
        "diff": -0.005506877901755031
      },
      {
        "logsig": 0,
        "node": "Node100pos",
        "diff": 0.0007791646898349986
      },
      {
        "logsig": 0,
        "node": "Node101pos",
        "diff": -0.0011431010449095224
      },
      {
        "logsig": 0,
        "node": "Node102pos",
        "diff": -0.0015961584603047167
      },
      {
        "logsig": 0.559358838452744,
        "node": "Node103pos",
        "diff": -0.0041944199588798995
      },
      {
        "logsig": 0,
        "node": "Node104pos",
        "diff": -0.0002209680208695084
      },
      {
        "logsig": 0,
        "node": "Node105pos",
        "diff": 0.00011231204637361653
      },
      {
        "logsig": 0.035442092710767856,
        "node": "Node106pos",
        "diff": 0.003524547172044573
      },
      {
        "logsig": 4.2395862522109535,
        "node": "Node107pos",
        "diff": 0.019091104141591275
      },
      {
        "logsig": 0.16409487725337835,
        "node": "Node108pos",
        "diff": -0.0033984477705554053
      },
      {
        "logsig": 3.722917112758203,
        "node": "Node109pos",
        "diff": -0.0090755045899862
      },
      {
        "logsig": 0,
        "node": "Node110pos",
        "diff": -0.00018155449728017882
      },
      {
        "logsig": 0,
        "node": "Node111pos",
        "diff": -0.0048520318908471995
      },
      {
        "logsig": 0,
        "node": "Node112pos",
        "diff": 0.003168564195670291
      },
      {
        "logsig": 0,
        "node": "Node113pos",
        "diff": -0.0037764967440109174
      },
      {
        "logsig": 0,
        "node": "Node114pos",
        "diff": -0.005701842477469982
      },
      {
        "logsig": 3.7163432681211086,
        "node": "Node115pos",
        "diff": -0.00961884144908753
      },
      {
        "logsig": 0,
        "node": "Node116pos",
        "diff": 0.003915437504574881
      },
      {
        "logsig": 0,
        "node": "Node117pos",
        "diff": 0.001611346638752548
      },
      {
        "logsig": 0,
        "node": "Node118pos",
        "diff": 0.0005229760341036807
      },
      {
        "logsig": 4.216672072404062,
        "node": "Node119pos",
        "diff": 0.015793742423331366
      },
      {
        "logsig": 0,
        "node": "Node120pos",
        "diff": 0.008529356076848859
      },
      {
        "logsig": 1.2707768796727703,
        "node": "Node121pos",
        "diff": 0.003589259170152897
      },
      {
        "logsig": 0,
        "node": "Node122pos",
        "diff": -0.001719113599232654
      },
      {
        "logsig": 0,
        "node": "Node123pos",
        "diff": 0.00013664162426881322
      },
      {
        "logsig": 0,
        "node": "Node124pos",
        "diff": -0.00028844601990659193
      },
      {
        "logsig": 0,
        "node": "Node125pos",
        "diff": 0.0015505872320789647
      },
      {
        "logsig": 0,
        "node": "Node126pos",
        "diff": -0.0006199132680445872
      },
      {
        "logsig": 0,
        "node": "Node127pos",
        "diff": -0.00013928674240790538
      },
      {
        "logsig": 0,
        "node": "Node128pos",
        "diff": 0.0017218066859509677
      },
      {
        "logsig": 0,
        "node": "Node129pos",
        "diff": 0.0027188056559741677
      },
      {
        "logsig": 4.45835733648446,
        "node": "Node130pos",
        "diff": 0.017277929071667954
      },
      {
        "logsig": 0,
        "node": "Node131pos",
        "diff": 0.0009670173686109893
      },
      {
        "logsig": 0,
        "node": "Node132pos",
        "diff": 0.0008842113240633957
      },
      {
        "logsig": 0.24929921942739985,
        "node": "Node133pos",
        "diff": -0.002504149602584263
      },
      {
        "logsig": 0,
        "node": "Node134pos",
        "diff": 0.010364427134025852
      },
      {
        "logsig": 0,
        "node": "Node135pos",
        "diff": 0.0014736360651393555
      },
      {
        "logsig": 0,
        "node": "Node136pos",
        "diff": -0.00002878783439631226
      },
      {
        "logsig": 3.0531583644236826,
        "node": "Node137pos",
        "diff": 0.0073753857396659
      },
      {
        "logsig": 0.519292471786279,
        "node": "Node138pos",
        "diff": 0.003884167195463768
      },
      {
        "logsig": 1.4436989912497982,
        "node": "Node139pos",
        "diff": 0.010210528023853029
      },
      {
        "logsig": 6.703753430972727,
        "node": "Node140pos",
        "diff": -0.03156895899804533
      },
      {
        "logsig": 0,
        "node": "Node141pos",
        "diff": 0.000298260903283365
      },
      {
        "logsig": 0.7837647065007464,
        "node": "Node142pos",
        "diff": -0.0036358402033655384
      },
      {
        "logsig": 0,
        "node": "Node143pos",
        "diff": -0.0006196980680863725
      },
      {
        "logsig": 0,
        "node": "Node144pos",
        "diff": 0.0001179423196335554
      },
      {
        "logsig": 0,
        "node": "Node145pos",
        "diff": 0.0005322213085345491
      },
      {
        "logsig": 0,
        "node": "Node146pos",
        "diff": 0.00138304411070272
      },
      {
        "logsig": 0,
        "node": "Node147pos",
        "diff": 0.0011734888736720814
      },
      {
        "logsig": 0,
        "node": "Node148pos",
        "diff": 0.0014697058781913365
      },
      {
        "logsig": 0,
        "node": "Node149pos",
        "diff": 0.0008256961234392806
      },
      {
        "logsig": 0,
        "node": "Node150pos",
        "diff": 0.0005547234441830249
      },
      {
        "logsig": 2.1180778049051976,
        "node": "Node151pos",
        "diff": 0.005023695136399471
      },
      {
        "logsig": 0,
        "node": "Node152pos",
        "diff": 0.0013547692196630243
      },
      {
        "logsig": 0,
        "node": "Node153pos",
        "diff": 0.0010597700495047564
      },
      {
        "logsig": 0.8459914699018187,
        "node": "Node154pos",
        "diff": 0.01687005062260804
      },
      {
        "logsig": 1.1532441306313912,
        "node": "Node155pos",
        "diff": -0.0035687806696611205
      },
      {
        "logsig": 0,
        "node": "Node156pos",
        "diff": -0.005178247552030938
      },
      {
        "logsig": 0,
        "node": "Node157pos",
        "diff": -0.0017822686594714055
      },
      {
        "logsig": 0,
        "node": "Node158pos",
        "diff": 0.0008003242814536081
      },
      {
        "logsig": 0,
        "node": "Node159pos",
        "diff": -0.0008968921988938498
      },
      {
        "logsig": 0,
        "node": "Node160pos",
        "diff": 0.0016935701167640825
      },
      {
        "logsig": 0,
        "node": "Node161pos",
        "diff": 0.0007732026476741866
      },
      {
        "logsig": 0,
        "node": "Node162pos",
        "diff": 0.000676371463428219
      },
      {
        "logsig": 0,
        "node": "Node163pos",
        "diff": -0.00048727735062481845
      },
      {
        "logsig": 0,
        "node": "Node164pos",
        "diff": 0.002103483333349328
      },
      {
        "logsig": 0,
        "node": "Node165pos",
        "diff": -0.0011767706046526608
      },
      {
        "logsig": 0,
        "node": "Node166pos",
        "diff": -0.0036530761659446494
      },
      {
        "logsig": 0,
        "node": "Node167pos",
        "diff": -0.001397861044233391
      },
      {
        "logsig": 0,
        "node": "Node168pos",
        "diff": 0.0005358316551559682
      },
      {
        "logsig": 0,
        "node": "Node169pos",
        "diff": -0.0029390762998012204
      },
      {
        "logsig": 3.0618845213178467,
        "node": "Node170pos",
        "diff": 0.006332314963545269
      },
      {
        "logsig": 0.42583655727145003,
        "node": "Node171pos",
        "diff": -0.00388607865342559
      },
      {
        "logsig": 0,
        "node": "Node172pos",
        "diff": -0.002191944514910005
      },
      {
        "logsig": 2.31344248871612,
        "node": "Node173pos",
        "diff": 0.009158382984720171
      },
      {
        "logsig": 0.1935580594942661,
        "node": "Node174pos",
        "diff": -0.0030820844463328397
      },
      {
        "logsig": 0,
        "node": "Node175pos",
        "diff": -0.00026383843530027203
      },
      {
        "logsig": 0,
        "node": "Node176pos",
        "diff": 0.0006777783384604874
      },
      {
        "logsig": 0,
        "node": "Node177pos",
        "diff": -0.0026783160744301066
      },
      {
        "logsig": 1.3022288822532493,
        "node": "Node178pos",
        "diff": 0.007289388578592675
      },
      {
        "logsig": 0,
        "node": "Node179pos",
        "diff": 0.0016807948114691534
      },
      {
        "logsig": 0,
        "node": "Node180pos",
        "diff": -0.00035185310215617366
      },
      {
        "logsig": 0,
        "node": "Node181pos",
        "diff": 0.0011049666761587882
      },
      {
        "logsig": 0,
        "node": "Node182pos",
        "diff": 0.0012329881297196473
      },
      {
        "logsig": 0,
        "node": "Node183pos",
        "diff": 0.001381647308637962
      },
      {
        "logsig": 0,
        "node": "Node184pos",
        "diff": 0.0001557723330164584
      },
      {
        "logsig": 0,
        "node": "Node185pos",
        "diff": -0.0010857388138144468
      },
      {
        "logsig": 0,
        "node": "Node186pos",
        "diff": -0.0038938817097526023
      },
      {
        "logsig": 0,
        "node": "Node187pos",
        "diff": 0.005816325560071666
      },
      {
        "logsig": 0.6214875388486989,
        "node": "Node188pos",
        "diff": 0.002641408469686197
      },
      {
        "logsig": 0,
        "node": "Node189pos",
        "diff": 0.004034840814190699
      },
      {
        "logsig": 0,
        "node": "Node190pos",
        "diff": 0.0003808969385467668
      },
      {
        "logsig": 4.128518171353482,
        "node": "Node191pos",
        "diff": 0.01562628150319295
      },
      {
        "logsig": 0,
        "node": "Node192pos",
        "diff": -0.00033726962183991833
      },
      {
        "logsig": 0,
        "node": "Node193pos",
        "diff": 0.005639604955352021
      },
      {
        "logsig": 0,
        "node": "Node194pos",
        "diff": 0.0007333842029103176
      },
      {
        "logsig": 0,
        "node": "Node195pos",
        "diff": 0.00021872399348564568
      },
      {
        "logsig": 0,
        "node": "Node196pos",
        "diff": 0.00008508501403928069
      },
      {
        "logsig": 0.9670727043515884,
        "node": "Node197pos",
        "diff": -0.004805429856194322
      },
      {
        "logsig": 2.453865395461053,
        "node": "Node198pos",
        "diff": 0.008218489587776745
      },
      {
        "logsig": 0,
        "node": "Node199pos",
        "diff": 0.0015215359908084868
      },
      {
        "logsig": 0.692422723429957,
        "node": "Node200pos",
        "diff": 0.004779539465199882
      },
      {
        "logsig": 0,
        "node": "Node201pos",
        "diff": 0.0009897431197105184
      },
      {
        "logsig": 0.1908650693878352,
        "node": "Node202pos",
        "diff": 0.003128756835952549
      },
      {
        "logsig": 0,
        "node": "Node203pos",
        "diff": -0.002241244477638916
      },
      {
        "logsig": 2.4825944969155325,
        "node": "Node204pos",
        "diff": 0.005545455586189702
      },
      {
        "logsig": 0,
        "node": "Node205pos",
        "diff": -0.0003836872448212256
      },
      {
        "logsig": 0,
        "node": "Node206pos",
        "diff": -0.0019482633137297657
      },
      {
        "logsig": 0,
        "node": "Node207pos",
        "diff": 0.0015874302776260345
      },
      {
        "logsig": 0,
        "node": "Node208pos",
        "diff": -0.0024876835524555193
      },
      {
        "logsig": 2.6019422566988686,
        "node": "Node209pos",
        "diff": 0.005787658261379871
      },
      {
        "logsig": 0,
        "node": "Node210pos",
        "diff": 0.002543151995676355
      },
      {
        "logsig": 0,
        "node": "Node211pos",
        "diff": -0.002075941560557754
      },
      {
        "logsig": 0,
        "node": "Node212pos",
        "diff": -0.00006748744214822356
      },
      {
        "logsig": 0,
        "node": "Node213pos",
        "diff": -0.0014998249891093128
      },
      {
        "logsig": 0,
        "node": "Node214pos",
        "diff": -0.0009451204421840092
      },
      {
        "logsig": 3.3032105026303302,
        "node": "Node215pos",
        "diff": -0.0072419841850951735
      },
      {
        "logsig": 0,
        "node": "Node216pos",
        "diff": 0.001714872837867843
      },
      {
        "logsig": 1.3322268312655914,
        "node": "Node217pos",
        "diff": -0.005987304617025986
      },
      {
        "logsig": 0,
        "node": "Node218pos",
        "diff": -0.0019217188234877949
      },
      {
        "logsig": 0,
        "node": "Node219pos",
        "diff": 0.00013619405189959976
      },
      {
        "logsig": 0.5036193328077437,
        "node": "Node220pos",
        "diff": 0.006014835350389111
      },
      {
        "logsig": 0,
        "node": "Node221pos",
        "diff": 0.0001552376995659929
      },
      {
        "logsig": 0,
        "node": "Node222pos",
        "diff": 0.0020916416355280525
      },
      {
        "logsig": 1.8453543729144437,
        "node": "Node223pos",
        "diff": 0.0055552227138175115
      },
      {
        "logsig": 0,
        "node": "Node224pos",
        "diff": -0.00009303811725595401
      },
      {
        "logsig": 0,
        "node": "Node225pos",
        "diff": -0.0005784614311097888
      },
      {
        "logsig": 0,
        "node": "Node226pos",
        "diff": 0.00945442909575607
      },
      {
        "logsig": 0,
        "node": "Node227pos",
        "diff": -0.0001875658061534085
      },
      {
        "logsig": 4.576626773043903,
        "node": "Node228pos",
        "diff": -0.011086684172773309
      },
      {
        "logsig": 0.26384476304563925,
        "node": "Node229pos",
        "diff": 0.006840512456218843
      },
      {
        "logsig": 0,
        "node": "Node230pos",
        "diff": 0.0019984909373020696
      },
      {
        "logsig": 0,
        "node": "Node231pos",
        "diff": 0.00301157353125178
      },
      {
        "logsig": 0,
        "node": "Node232pos",
        "diff": 0.001175200152471436
      },
      {
        "logsig": 6.506756934383988,
        "node": "Node233pos",
        "diff": -0.03574346727491773
      },
      {
        "logsig": 0,
        "node": "Node234pos",
        "diff": 0.0005052126593149361
      },
      {
        "logsig": 0,
        "node": "Node235pos",
        "diff": 0.00007448454490754857
      },
      {
        "logsig": 0,
        "node": "Node236pos",
        "diff": 0.004053875686511221
      },
      {
        "logsig": 0.39685166781278974,
        "node": "Node237pos",
        "diff": 0.0029753845752316338
      },
      {
        "logsig": 0,
        "node": "Node238pos",
        "diff": 9.75412510211241e-7
      },
      {
        "logsig": 1.264270538324892,
        "node": "Node239pos",
        "diff": -0.003625285701504012
      },
      {
        "logsig": 0,
        "node": "Node240pos",
        "diff": 0.002528172150878376
      },
      {
        "logsig": 0,
        "node": "Node241pos",
        "diff": 0.0012867115508459455
      },
      {
        "logsig": 0,
        "node": "Node242pos",
        "diff": 0.006956689030643994
      },
      {
        "logsig": 0,
        "node": "Node243pos",
        "diff": 0.0017556986286703412
      },
      {
        "logsig": 0.5724944495602816,
        "node": "Node244pos",
        "diff": 0.003290101295712941
      },
      {
        "logsig": 0,
        "node": "Node245pos",
        "diff": 0.00019549625728667496
      },
      {
        "logsig": 2.163816085070501,
        "node": "Node246pos",
        "diff": 0.009554166200321878
      },
      {
        "logsig": 0,
        "node": "Node247pos",
        "diff": 0.0011883484120047663
      },
      {
        "logsig": 0,
        "node": "Node248pos",
        "diff": -0.001066709871860392
      },
      {
        "logsig": 0,
        "node": "Node249pos",
        "diff": 0.001308273937097343
      },
      {
        "logsig": 0,
        "node": "Node250pos",
        "diff": -0.0007780010589901715
      },
      {
        "logsig": 2.107798719119684,
        "node": "Node251pos",
        "diff": 0.004358345405717705
      },
      {
        "logsig": 0,
        "node": "Node252pos",
        "diff": 0.001008177717301859
      },
      {
        "logsig": 0,
        "node": "Node253pos",
        "diff": 0.0034995872430192056
      },
      {
        "logsig": 0,
        "node": "Node254pos",
        "diff": 0.00008910027853725284
      },
      {
        "logsig": 0,
        "node": "Node255pos",
        "diff": 0.0015867576770467364
      },
      {
        "logsig": 0,
        "node": "Node256pos",
        "diff": 0.002350269201931337
      },
      {
        "logsig": 0,
        "node": "Node257pos",
        "diff": 0.004599892249681308
      },
      {
        "logsig": 0.3379804201289846,
        "node": "Node258pos",
        "diff": 0.00299101201972555
      },
      {
        "logsig": 1.8067589082041164,
        "node": "Node259pos",
        "diff": 0.004125933633121614
      },
      {
        "logsig": 0,
        "node": "Node260pos",
        "diff": -0.00005549338618089799
      },
      {
        "logsig": 0,
        "node": "Node261pos",
        "diff": -0.0004620342316439166
      },
      {
        "logsig": 0,
        "node": "Node262pos",
        "diff": 0.0015172070996766177
      },
      {
        "logsig": 0.3507718394713413,
        "node": "Node263pos",
        "diff": 0.0022193351672975987
      },
      {
        "logsig": 0,
        "node": "Node264pos",
        "diff": -0.0021636398952788677
      },
      {
        "logsig": 0.5546493761650088,
        "node": "Node265pos",
        "diff": -0.002275932402808329
      },
      {
        "logsig": 0,
        "node": "Node266pos",
        "diff": 0.0010003754809280669
      },
      {
        "logsig": 0,
        "node": "Node267pos",
        "diff": 0.001650213686116204
      },
      {
        "logsig": 0,
        "node": "Node268pos",
        "diff": 0.0015343922258798937
      },
      {
        "logsig": 4.319970426746455,
        "node": "Node269pos",
        "diff": 0.02071884498871691
      },
      {
        "logsig": 0,
        "node": "Node270pos",
        "diff": 0.0004990095106751298
      },
      {
        "logsig": 0,
        "node": "Node271pos",
        "diff": -0.0018955615282113085
      },
      {
        "logsig": 0,
        "node": "Node272pos",
        "diff": 0.0015977173754542144
      },
      {
        "logsig": 0,
        "node": "Node273pos",
        "diff": -0.00005778640960620313
      },
      {
        "logsig": 0,
        "node": "Node274pos",
        "diff": -0.0015203428338787664
      },
      {
        "logsig": 5.2150300683301385,
        "node": "Node275pos",
        "diff": -0.014193362644542419
      },
      {
        "logsig": 0,
        "node": "Node276pos",
        "diff": 0.0030141983454977264
      },
      {
        "logsig": 0,
        "node": "Node277pos",
        "diff": -0.002015977221032327
      },
      {
        "logsig": 4.4527339803921535,
        "node": "Node278pos",
        "diff": -0.009394433045373976
      },
      {
        "logsig": 0,
        "node": "Node279pos",
        "diff": 0.0010497998241628882
      },
      {
        "logsig": 0,
        "node": "Node280pos",
        "diff": 0.0018962383190834183
      },
      {
        "logsig": 0,
        "node": "Node281pos",
        "diff": 0.0010168628088725099
      },
      {
        "logsig": 0,
        "node": "Node282pos",
        "diff": 0.0017571220994780712
      },
      {
        "logsig": 0,
        "node": "Node283pos",
        "diff": -0.0011729249805343255
      },
      {
        "logsig": 0,
        "node": "Node284pos",
        "diff": 0.00004699751512109043
      },
      {
        "logsig": 0.8782936770041436,
        "node": "Node285pos",
        "diff": 0.003063454145971709
      },
      {
        "logsig": 0,
        "node": "Node286pos",
        "diff": -0.00043216469747158257
      },
      {
        "logsig": 0,
        "node": "Node287pos",
        "diff": -0.000553944310264785
      },
      {
        "logsig": 0.04982919641756926,
        "node": "Node288pos",
        "diff": 0.006096242883260669
      },
      {
        "logsig": 0,
        "node": "Node289pos",
        "diff": 0.0017002585359181485
      },
      {
        "logsig": 0,
        "node": "Node290pos",
        "diff": -0.002543540201753769
      },
      {
        "logsig": 0,
        "node": "Node291pos",
        "diff": -0.0012354399924195596
      },
      {
        "logsig": 2.4035317545331063,
        "node": "Node292pos",
        "diff": 0.004453206281306361
      },
      {
        "logsig": 0,
        "node": "Node293pos",
        "diff": 0.0009787702720732666
      },
      {
        "logsig": 0,
        "node": "Node294pos",
        "diff": 0.0032678755841139373
      },
      {
        "logsig": 0,
        "node": "Node295pos",
        "diff": 0.003323195331136284
      },
      {
        "logsig": 0,
        "node": "Node296pos",
        "diff": -0.00010790235916964681
      },
      {
        "logsig": 0,
        "node": "Node297pos",
        "diff": 0.0009987745738208296
      },
      {
        "logsig": 0,
        "node": "Node298pos",
        "diff": 0.002042700636983544
      },
      {
        "logsig": 4.678405423553562,
        "node": "Node299pos",
        "diff": 0.014978826306215831
      },
      {
        "logsig": 0,
        "node": "Node300pos",
        "diff": 0.0005119533491305659
      },
      {
        "logsig": 0,
        "node": "Node1neg",
        "diff": 0.0038263619925228633
      },
      {
        "logsig": 0,
        "node": "Node2neg",
        "diff": -0.0011278262246219221
      },
      {
        "logsig": 0,
        "node": "Node3neg",
        "diff": -0.0027323458847498512
      },
      {
        "logsig": 0,
        "node": "Node4neg",
        "diff": -0.0004637128751133598
      },
      {
        "logsig": 0,
        "node": "Node5neg",
        "diff": 0.005385512318754008
      },
      {
        "logsig": 3.2063651771440007,
        "node": "Node6neg",
        "diff": -0.010472357872313395
      },
      {
        "logsig": 1.1436459001934005,
        "node": "Node7neg",
        "diff": -0.003909823214062342
      },
      {
        "logsig": 0,
        "node": "Node8neg",
        "diff": 0.000578031396160411
      },
      {
        "logsig": 0,
        "node": "Node9neg",
        "diff": 0.002150691001032737
      },
      {
        "logsig": 1.240511314007933,
        "node": "Node10neg",
        "diff": -0.0067807798884336025
      },
      {
        "logsig": 1.0236471605076152,
        "node": "Node11neg",
        "diff": 0.00430867992414435
      },
      {
        "logsig": 0,
        "node": "Node12neg",
        "diff": 0.0016762462150350195
      },
      {
        "logsig": 0,
        "node": "Node13neg",
        "diff": 0.009864611780160164
      },
      {
        "logsig": 0,
        "node": "Node14neg",
        "diff": 0.0014318091506578324
      },
      {
        "logsig": 0,
        "node": "Node15neg",
        "diff": 0.0005071279350389687
      },
      {
        "logsig": 0,
        "node": "Node16neg",
        "diff": -0.00008230145573464888
      },
      {
        "logsig": 2.0547363301719725,
        "node": "Node17neg",
        "diff": -0.004102216466860636
      },
      {
        "logsig": 0.2957194715235665,
        "node": "Node18neg",
        "diff": 0.00399934039703964
      },
      {
        "logsig": 1.6878227421292311,
        "node": "Node19neg",
        "diff": -0.0052958209301863825
      },
      {
        "logsig": 0,
        "node": "Node20neg",
        "diff": 0.005790561773331678
      },
      {
        "logsig": 0.24277539908976106,
        "node": "Node21neg",
        "diff": 0.0030149081902667977
      },
      {
        "logsig": 0,
        "node": "Node22neg",
        "diff": -0.0006886965188039332
      },
      {
        "logsig": 0.5994787445946471,
        "node": "Node23neg",
        "diff": -0.007006272344973876
      },
      {
        "logsig": 0.7320633825874733,
        "node": "Node24neg",
        "diff": 0.003838355339379053
      },
      {
        "logsig": 0,
        "node": "Node25neg",
        "diff": 0.002381531487238481
      },
      {
        "logsig": 0,
        "node": "Node26neg",
        "diff": 0.0038886341800847173
      },
      {
        "logsig": 3.468640252842041,
        "node": "Node27neg",
        "diff": 0.01748348172844504
      },
      {
        "logsig": 4.016638582383831,
        "node": "Node28neg",
        "diff": 0.010249817034470487
      },
      {
        "logsig": 0.3138576302483901,
        "node": "Node29neg",
        "diff": 0.004450077990347633
      },
      {
        "logsig": 0.5099878941379259,
        "node": "Node30neg",
        "diff": 0.003012924439860541
      },
      {
        "logsig": 4.513467772242227,
        "node": "Node31neg",
        "diff": -0.010724655205722034
      },
      {
        "logsig": 0,
        "node": "Node32neg",
        "diff": -0.0012350106027854554
      },
      {
        "logsig": 4.323957109825853,
        "node": "Node33neg",
        "diff": 0.016585802165571026
      },
      {
        "logsig": 0,
        "node": "Node34neg",
        "diff": -0.005422945401877321
      },
      {
        "logsig": 1.9731625030066084,
        "node": "Node35neg",
        "diff": 0.004159931539348532
      },
      {
        "logsig": 0,
        "node": "Node36neg",
        "diff": -0.0014208250781611506
      },
      {
        "logsig": 0.2413355810246201,
        "node": "Node37neg",
        "diff": 0.0045189768348294895
      },
      {
        "logsig": 4.77495615734289,
        "node": "Node38neg",
        "diff": 0.02002276701900197
      },
      {
        "logsig": 3.936763313286692,
        "node": "Node39neg",
        "diff": -0.01191839956139877
      },
      {
        "logsig": 0,
        "node": "Node40neg",
        "diff": -0.00015004561953447894
      },
      {
        "logsig": 0.7255030168343406,
        "node": "Node41neg",
        "diff": 0.007513083733562483
      },
      {
        "logsig": 0,
        "node": "Node42neg",
        "diff": -0.0016386457001580485
      },
      {
        "logsig": 0.6797763009447664,
        "node": "Node43neg",
        "diff": 0.00394195574040071
      },
      {
        "logsig": 0.9186483801875329,
        "node": "Node44neg",
        "diff": 0.005447133407934629
      },
      {
        "logsig": 0.79884593091182,
        "node": "Node45neg",
        "diff": -0.003159074940899371
      },
      {
        "logsig": 1.6388402883719015,
        "node": "Node46neg",
        "diff": 0.004648513835086654
      },
      {
        "logsig": 1.2938759785168357,
        "node": "Node47neg",
        "diff": -0.005956249109815001
      },
      {
        "logsig": 0.2500787445651363,
        "node": "Node48neg",
        "diff": -0.0024837278526767858
      },
      {
        "logsig": 0,
        "node": "Node49neg",
        "diff": -0.00232991736559156
      },
      {
        "logsig": 0.7775377470180435,
        "node": "Node50neg",
        "diff": 0.01187795243196951
      },
      {
        "logsig": 0,
        "node": "Node51neg",
        "diff": -0.001228054744937047
      },
      {
        "logsig": 0,
        "node": "Node52neg",
        "diff": -0.0019798582024837773
      },
      {
        "logsig": 0,
        "node": "Node53neg",
        "diff": -0.001046764417341974
      },
      {
        "logsig": 0,
        "node": "Node54neg",
        "diff": 0.0012791134622107262
      },
      {
        "logsig": 0.076220061536842,
        "node": "Node55neg",
        "diff": 0.0028276922216154163
      },
      {
        "logsig": 0.8780490335299723,
        "node": "Node56neg",
        "diff": -0.004708708298685858
      },
      {
        "logsig": 1.1099826643117956,
        "node": "Node57neg",
        "diff": 0.013947187638606737
      },
      {
        "logsig": 0,
        "node": "Node58neg",
        "diff": 0.005092413351648686
      },
      {
        "logsig": 0.5536404867465603,
        "node": "Node59neg",
        "diff": 0.003794956462061162
      },
      {
        "logsig": 1.1089664724517014,
        "node": "Node60neg",
        "diff": 0.013878310940789715
      },
      {
        "logsig": 0,
        "node": "Node61neg",
        "diff": 0.002860539290564179
      },
      {
        "logsig": 0,
        "node": "Node62neg",
        "diff": 0.0020812983258944933
      },
      {
        "logsig": 3.998175018498944,
        "node": "Node63neg",
        "diff": -0.008040483068931502
      },
      {
        "logsig": 0.266310360022349,
        "node": "Node64neg",
        "diff": -0.002690110627526824
      },
      {
        "logsig": 0.3944470128743718,
        "node": "Node65neg",
        "diff": 0.005380967013534272
      },
      {
        "logsig": 0,
        "node": "Node66neg",
        "diff": 0.002021280497854688
      },
      {
        "logsig": 0,
        "node": "Node67neg",
        "diff": 0.004482391708489125
      },
      {
        "logsig": 0,
        "node": "Node68neg",
        "diff": -0.002287834026221159
      },
      {
        "logsig": 0.20601501802002548,
        "node": "Node69neg",
        "diff": 0.0028716873658222388
      },
      {
        "logsig": 0,
        "node": "Node70neg",
        "diff": -0.00033377848034921864
      },
      {
        "logsig": 0,
        "node": "Node71neg",
        "diff": 0.001472310276000175
      },
      {
        "logsig": 0,
        "node": "Node72neg",
        "diff": -0.0003650340820118065
      },
      {
        "logsig": 0,
        "node": "Node73neg",
        "diff": -0.00019820118395792643
      },
      {
        "logsig": 1.4366479964444645,
        "node": "Node74neg",
        "diff": 0.004374118310981511
      },
      {
        "logsig": 0,
        "node": "Node75neg",
        "diff": 0.007238937339854969
      },
      {
        "logsig": 0,
        "node": "Node76neg",
        "diff": 0.0018546887631871718
      },
      {
        "logsig": 0.643861011520432,
        "node": "Node77neg",
        "diff": 0.009326871303441129
      },
      {
        "logsig": 0,
        "node": "Node78neg",
        "diff": 0.0011038674431639662
      },
      {
        "logsig": 0,
        "node": "Node79neg",
        "diff": 0.0017448381868299626
      },
      {
        "logsig": 0,
        "node": "Node80neg",
        "diff": 0.0006522769230807074
      },
      {
        "logsig": 0,
        "node": "Node81neg",
        "diff": -0.0014515320129493427
      },
      {
        "logsig": 0,
        "node": "Node82neg",
        "diff": 0.00003517879214695597
      },
      {
        "logsig": 0,
        "node": "Node83neg",
        "diff": 0.001511081872477018
      },
      {
        "logsig": 0,
        "node": "Node84neg",
        "diff": -0.00028823578445984715
      },
      {
        "logsig": 0,
        "node": "Node85neg",
        "diff": -0.001616037032297006
      },
      {
        "logsig": 0,
        "node": "Node86neg",
        "diff": 0.006689050723313976
      },
      {
        "logsig": 0,
        "node": "Node87neg",
        "diff": 0.0013948169925853515
      },
      {
        "logsig": 0,
        "node": "Node88neg",
        "diff": -0.0016817314902355081
      },
      {
        "logsig": 0,
        "node": "Node89neg",
        "diff": 0.0012611107453210618
      },
      {
        "logsig": 0,
        "node": "Node90neg",
        "diff": -0.0032230085076675567
      },
      {
        "logsig": 1.2588668410984616,
        "node": "Node91neg",
        "diff": 0.007615721606579906
      },
      {
        "logsig": 0,
        "node": "Node92neg",
        "diff": -0.0007709982485693746
      },
      {
        "logsig": 0,
        "node": "Node93neg",
        "diff": 0.00377923716518552
      },
      {
        "logsig": 2.06194008245251,
        "node": "Node94neg",
        "diff": 0.008358597373253455
      },
      {
        "logsig": 0,
        "node": "Node95neg",
        "diff": 0.00010488863551280368
      },
      {
        "logsig": 0,
        "node": "Node96neg",
        "diff": 0.0009344971316635932
      },
      {
        "logsig": 0,
        "node": "Node97neg",
        "diff": -0.0024837977539385373
      },
      {
        "logsig": 0,
        "node": "Node98neg",
        "diff": 0.0012083845056526667
      },
      {
        "logsig": 0.8912212724886261,
        "node": "Node99neg",
        "diff": 0.008443982081749452
      },
      {
        "logsig": 0,
        "node": "Node100neg",
        "diff": 0.00435887002442424
      },
      {
        "logsig": 2.398417087230141,
        "node": "Node101neg",
        "diff": 0.007217476281582828
      },
      {
        "logsig": 0,
        "node": "Node102neg",
        "diff": 0.002512009644644993
      },
      {
        "logsig": 0,
        "node": "Node103neg",
        "diff": -0.002767268348310014
      },
      {
        "logsig": 0,
        "node": "Node104neg",
        "diff": 0.0010117257687662108
      },
      {
        "logsig": 0,
        "node": "Node105neg",
        "diff": 0.004403270809293982
      },
      {
        "logsig": 0,
        "node": "Node106neg",
        "diff": 0.0000986008301472181
      },
      {
        "logsig": 0,
        "node": "Node107neg",
        "diff": -0.004636915799868659
      },
      {
        "logsig": 0,
        "node": "Node108neg",
        "diff": 0.000550503702054671
      },
      {
        "logsig": 0,
        "node": "Node109neg",
        "diff": 0.004419995180949112
      },
      {
        "logsig": 0,
        "node": "Node110neg",
        "diff": -0.003058481119997884
      },
      {
        "logsig": 1.9189254011336252,
        "node": "Node111neg",
        "diff": 0.007004098930499701
      },
      {
        "logsig": 1.2980299016787966,
        "node": "Node112neg",
        "diff": -0.006259136120809639
      },
      {
        "logsig": 2.7305498589583124,
        "node": "Node113neg",
        "diff": 0.0076520149250389625
      },
      {
        "logsig": 1.6777032084226018,
        "node": "Node114neg",
        "diff": 0.0073683266520573765
      },
      {
        "logsig": 0,
        "node": "Node115neg",
        "diff": -0.000467157521420045
      },
      {
        "logsig": 0,
        "node": "Node116neg",
        "diff": -0.0006823849733477625
      },
      {
        "logsig": 0,
        "node": "Node117neg",
        "diff": -0.0025852876204004553
      },
      {
        "logsig": 0.36980834697794535,
        "node": "Node118neg",
        "diff": -0.0028366713765449
      },
      {
        "logsig": 2.049384640879917,
        "node": "Node119neg",
        "diff": -0.0047261426253359645
      },
      {
        "logsig": 0,
        "node": "Node120neg",
        "diff": -0.0015148805225539954
      },
      {
        "logsig": 0,
        "node": "Node121neg",
        "diff": 0.008967275112971004
      },
      {
        "logsig": 2.2637400380996757,
        "node": "Node122neg",
        "diff": 0.007985951170077452
      },
      {
        "logsig": 0,
        "node": "Node123neg",
        "diff": -0.000614993434481854
      },
      {
        "logsig": 0,
        "node": "Node124neg",
        "diff": -0.0008996896820822907
      },
      {
        "logsig": 0,
        "node": "Node125neg",
        "diff": -0.002343112265567173
      },
      {
        "logsig": 0,
        "node": "Node126neg",
        "diff": 0.0018866957851981048
      },
      {
        "logsig": 0,
        "node": "Node127neg",
        "diff": 0.005722428815497883
      },
      {
        "logsig": 0,
        "node": "Node128neg",
        "diff": 0.002513066025328914
      },
      {
        "logsig": 0.8958867873986821,
        "node": "Node129neg",
        "diff": -0.0033313988825381035
      },
      {
        "logsig": 1.5208276693275462,
        "node": "Node130neg",
        "diff": -0.006100816977169651
      },
      {
        "logsig": 0,
        "node": "Node131neg",
        "diff": -0.0016927008620814918
      },
      {
        "logsig": 1.5006050640061548,
        "node": "Node132neg",
        "diff": -0.005940121719867012
      },
      {
        "logsig": 0,
        "node": "Node133neg",
        "diff": 0.0014920077857028561
      },
      {
        "logsig": 0,
        "node": "Node134neg",
        "diff": 0.0002410127297773038
      },
      {
        "logsig": 0,
        "node": "Node135neg",
        "diff": 0.0017266583437391858
      },
      {
        "logsig": 0,
        "node": "Node136neg",
        "diff": 0.00039350366851764284
      },
      {
        "logsig": 0,
        "node": "Node137neg",
        "diff": -0.002823982106882916
      },
      {
        "logsig": 0.8815771842909741,
        "node": "Node138neg",
        "diff": 0.003991653709771261
      },
      {
        "logsig": 0,
        "node": "Node139neg",
        "diff": 0.00287737364776921
      },
      {
        "logsig": 0.09900071080933356,
        "node": "Node140neg",
        "diff": 0.0034365815308092513
      },
      {
        "logsig": 0,
        "node": "Node141neg",
        "diff": -0.0009008967921326767
      },
      {
        "logsig": 2.081719417725155,
        "node": "Node142neg",
        "diff": -0.004474692718305279
      },
      {
        "logsig": 1.4926002050937888,
        "node": "Node143neg",
        "diff": 0.006041631766669951
      },
      {
        "logsig": 0.5110315594984044,
        "node": "Node144neg",
        "diff": 0.005203001867359734
      },
      {
        "logsig": 0,
        "node": "Node145neg",
        "diff": -0.00014486245824679638
      },
      {
        "logsig": 0,
        "node": "Node146neg",
        "diff": 0.003278123043791696
      },
      {
        "logsig": 0,
        "node": "Node147neg",
        "diff": 0.0020527942330123266
      },
      {
        "logsig": 0,
        "node": "Node148neg",
        "diff": 0.0010777129654092354
      },
      {
        "logsig": 0,
        "node": "Node149neg",
        "diff": -0.004683730436973316
      },
      {
        "logsig": 0,
        "node": "Node150neg",
        "diff": 0.0010908063316549905
      },
      {
        "logsig": 0.6519771502899706,
        "node": "Node151neg",
        "diff": -0.00598984372938998
      },
      {
        "logsig": 0.671442209983172,
        "node": "Node152neg",
        "diff": -0.003946987888395363
      },
      {
        "logsig": 0,
        "node": "Node153neg",
        "diff": -0.0008669008352725871
      },
      {
        "logsig": 0,
        "node": "Node154neg",
        "diff": 0.00017286350180062727
      },
      {
        "logsig": 0.20614503231129586,
        "node": "Node155neg",
        "diff": 0.01506104529191096
      },
      {
        "logsig": 0,
        "node": "Node156neg",
        "diff": 0.0022927757806937804
      },
      {
        "logsig": 1.024309066527033,
        "node": "Node157neg",
        "diff": 0.0038666210441504548
      },
      {
        "logsig": 6.593712126465593,
        "node": "Node158neg",
        "diff": -0.02641393453238771
      },
      {
        "logsig": 0,
        "node": "Node159neg",
        "diff": -0.001922213205128491
      },
      {
        "logsig": 0.6276249789783671,
        "node": "Node160neg",
        "diff": -0.003878318464043681
      },
      {
        "logsig": 2.7177905203281134,
        "node": "Node161neg",
        "diff": 0.006048908545950175
      },
      {
        "logsig": 0.8107614685873448,
        "node": "Node162neg",
        "diff": -0.005658522450303757
      },
      {
        "logsig": 0,
        "node": "Node163neg",
        "diff": -0.0018679375388489085
      },
      {
        "logsig": 1.8395526507502833,
        "node": "Node164neg",
        "diff": -0.0061268736193677955
      },
      {
        "logsig": 0,
        "node": "Node165neg",
        "diff": 0.0002265001486183799
      },
      {
        "logsig": 2.1910309712494764,
        "node": "Node166neg",
        "diff": 0.00613173920384421
      },
      {
        "logsig": 0.2861079000213718,
        "node": "Node167neg",
        "diff": 0.005350324729609697
      },
      {
        "logsig": 0,
        "node": "Node168neg",
        "diff": -0.0013318285653144725
      },
      {
        "logsig": 1.5791823596584864,
        "node": "Node169neg",
        "diff": 0.005395882849424396
      },
      {
        "logsig": 0,
        "node": "Node170neg",
        "diff": 0.0006494996565746109
      },
      {
        "logsig": 0.6735533753415224,
        "node": "Node171neg",
        "diff": 0.0025746786762608853
      },
      {
        "logsig": 0,
        "node": "Node172neg",
        "diff": 0.00004835749161455808
      },
      {
        "logsig": 0,
        "node": "Node173neg",
        "diff": 0.00013060022815765754
      },
      {
        "logsig": 0,
        "node": "Node174neg",
        "diff": 0.0011223779564005015
      },
      {
        "logsig": 0,
        "node": "Node175neg",
        "diff": 0.004252082748816532
      },
      {
        "logsig": 0,
        "node": "Node176neg",
        "diff": 0.0010347613747963065
      },
      {
        "logsig": 0,
        "node": "Node177neg",
        "diff": 0.0011197394322795583
      },
      {
        "logsig": 2.347396097620429,
        "node": "Node178neg",
        "diff": -0.00475665424328179
      },
      {
        "logsig": 0,
        "node": "Node179neg",
        "diff": 0.00031629585104121723
      },
      {
        "logsig": 0,
        "node": "Node180neg",
        "diff": 0.00041656963576943757
      },
      {
        "logsig": 0.8101934217410305,
        "node": "Node181neg",
        "diff": -0.005342576586949492
      },
      {
        "logsig": 0,
        "node": "Node182neg",
        "diff": 0.0013702142495236405
      },
      {
        "logsig": 0,
        "node": "Node183neg",
        "diff": 0.0008449533822760256
      },
      {
        "logsig": 0,
        "node": "Node184neg",
        "diff": -0.0004311261828344263
      },
      {
        "logsig": 5.362710657556212,
        "node": "Node185neg",
        "diff": -0.014166327958265678
      },
      {
        "logsig": 0,
        "node": "Node186neg",
        "diff": 0.0011360409708601668
      },
      {
        "logsig": 2.0386174925914617,
        "node": "Node187neg",
        "diff": -0.006403291504508496
      },
      {
        "logsig": 0.8377225375221264,
        "node": "Node188neg",
        "diff": -0.002842821030328237
      },
      {
        "logsig": 2.702186679735569,
        "node": "Node189neg",
        "diff": 0.006720997550785986
      },
      {
        "logsig": 2.598910458210096,
        "node": "Node190neg",
        "diff": -0.005159242983093542
      },
      {
        "logsig": 1.2435535278411478,
        "node": "Node191neg",
        "diff": -0.0039488949756062925
      },
      {
        "logsig": 0,
        "node": "Node192neg",
        "diff": 0.0015501691988461035
      },
      {
        "logsig": 0,
        "node": "Node193neg",
        "diff": 0.0013475180536391088
      },
      {
        "logsig": 1.562049062385751,
        "node": "Node194neg",
        "diff": 0.00479397633662625
      },
      {
        "logsig": 0,
        "node": "Node195neg",
        "diff": 0.0015052404810160936
      },
      {
        "logsig": 0,
        "node": "Node196neg",
        "diff": -0.001203606348374242
      },
      {
        "logsig": 3.0684011701505227,
        "node": "Node197neg",
        "diff": 0.007584947990235864
      },
      {
        "logsig": 0,
        "node": "Node198neg",
        "diff": -0.0047634636618069355
      },
      {
        "logsig": 1.4250346472790971,
        "node": "Node199neg",
        "diff": 0.003480073957966949
      },
      {
        "logsig": 0,
        "node": "Node200neg",
        "diff": 0.0006866857018388229
      },
      {
        "logsig": 0,
        "node": "Node201neg",
        "diff": -0.0039735621487213
      },
      {
        "logsig": 0,
        "node": "Node202neg",
        "diff": 0.0018115627759996648
      },
      {
        "logsig": 0,
        "node": "Node203neg",
        "diff": -0.0010134127277960014
      },
      {
        "logsig": 0,
        "node": "Node204neg",
        "diff": 0.005084302378357558
      },
      {
        "logsig": 1.5472150226718626,
        "node": "Node205neg",
        "diff": 0.026608779260430957
      },
      {
        "logsig": 2.8107776994822906,
        "node": "Node206neg",
        "diff": 0.006102017324922037
      },
      {
        "logsig": 0,
        "node": "Node207neg",
        "diff": -0.0002505643815146774
      },
      {
        "logsig": 0.26518965473762296,
        "node": "Node208neg",
        "diff": 0.002704976668495812
      },
      {
        "logsig": 0,
        "node": "Node209neg",
        "diff": -0.0001887498174018609
      },
      {
        "logsig": 0,
        "node": "Node210neg",
        "diff": 0.0015386886329801187
      },
      {
        "logsig": 0,
        "node": "Node211neg",
        "diff": 0.0010566044817490014
      },
      {
        "logsig": 2.487804557626565,
        "node": "Node212neg",
        "diff": 0.005559337168254313
      },
      {
        "logsig": 0,
        "node": "Node213neg",
        "diff": 0.0030934443026779802
      },
      {
        "logsig": 4.560307073749748,
        "node": "Node214neg",
        "diff": 0.01272747498681553
      },
      {
        "logsig": 0,
        "node": "Node215neg",
        "diff": 0.0016618706768521715
      },
      {
        "logsig": 0,
        "node": "Node216neg",
        "diff": -0.00040331785237293774
      },
      {
        "logsig": 0,
        "node": "Node217neg",
        "diff": 0.001474306529500291
      },
      {
        "logsig": 0,
        "node": "Node218neg",
        "diff": -0.002528828548990068
      },
      {
        "logsig": 0,
        "node": "Node219neg",
        "diff": -0.001730370037660333
      },
      {
        "logsig": 0,
        "node": "Node220neg",
        "diff": -0.001240753060640535
      },
      {
        "logsig": 0,
        "node": "Node221neg",
        "diff": 0.0011673104656793596
      },
      {
        "logsig": 0.8301855189792596,
        "node": "Node222neg",
        "diff": 0.0035028665473446604
      },
      {
        "logsig": 0,
        "node": "Node223neg",
        "diff": -0.0005492691178551704
      },
      {
        "logsig": 3.2016845622023844,
        "node": "Node224neg",
        "diff": 0.009870121800112165
      },
      {
        "logsig": 0,
        "node": "Node225neg",
        "diff": 0.0006796061885331097
      },
      {
        "logsig": 1.0621910938902621,
        "node": "Node226neg",
        "diff": 0.0031507427741966905
      },
      {
        "logsig": 0,
        "node": "Node227neg",
        "diff": 0.0016170549151360966
      },
      {
        "logsig": 1.963925924529676,
        "node": "Node228neg",
        "diff": 0.004718251734831059
      },
      {
        "logsig": 0,
        "node": "Node229neg",
        "diff": 0.0009858100780944586
      },
      {
        "logsig": 0.4883360877366521,
        "node": "Node230neg",
        "diff": 0.0033271923387045163
      },
      {
        "logsig": 0,
        "node": "Node231neg",
        "diff": 0.0004089851176924213
      },
      {
        "logsig": 0,
        "node": "Node232neg",
        "diff": -0.0006855907009128494
      },
      {
        "logsig": 1.80025730373519,
        "node": "Node233neg",
        "diff": 0.007020895585012891
      },
      {
        "logsig": 0,
        "node": "Node234neg",
        "diff": -0.000167148792324226
      },
      {
        "logsig": 0,
        "node": "Node235neg",
        "diff": -0.0026512052966292444
      },
      {
        "logsig": 0,
        "node": "Node236neg",
        "diff": 0.0005238143749827221
      },
      {
        "logsig": 1.294517972706232,
        "node": "Node237neg",
        "diff": -0.006996117889907782
      },
      {
        "logsig": 1.2942068414975911,
        "node": "Node238neg",
        "diff": -0.003900970278179034
      },
      {
        "logsig": 0.13152741665442125,
        "node": "Node239neg",
        "diff": -0.002331686830092909
      },
      {
        "logsig": 0,
        "node": "Node240neg",
        "diff": -0.0016406540715512134
      },
      {
        "logsig": 0.15663663348354304,
        "node": "Node241neg",
        "diff": 0.002755056854895353
      },
      {
        "logsig": 0.4825738684696023,
        "node": "Node242neg",
        "diff": 0.004172025079414214
      },
      {
        "logsig": 0,
        "node": "Node243neg",
        "diff": 0.0042552514727811856
      },
      {
        "logsig": 0.8485262636347777,
        "node": "Node244neg",
        "diff": 0.004132068504482811
      },
      {
        "logsig": 0,
        "node": "Node245neg",
        "diff": -0.0018466444907677103
      },
      {
        "logsig": 0,
        "node": "Node246neg",
        "diff": -0.0013733709584304527
      },
      {
        "logsig": 0.5689694928812978,
        "node": "Node247neg",
        "diff": -0.003700468688779878
      },
      {
        "logsig": 0,
        "node": "Node248neg",
        "diff": -0.0003882454554308542
      },
      {
        "logsig": 0,
        "node": "Node249neg",
        "diff": -0.00043717579613047127
      },
      {
        "logsig": 4.001698538193256,
        "node": "Node250neg",
        "diff": 0.013313067995723248
      },
      {
        "logsig": 0,
        "node": "Node251neg",
        "diff": 0.0012860444348805375
      },
      {
        "logsig": 2.798827293705917,
        "node": "Node252neg",
        "diff": 0.007686296290079639
      },
      {
        "logsig": 0,
        "node": "Node253neg",
        "diff": -0.0016306757544756185
      },
      {
        "logsig": 0,
        "node": "Node254neg",
        "diff": 0.0014592221447335806
      },
      {
        "logsig": 1.7683170933337853,
        "node": "Node255neg",
        "diff": 0.004181066278966423
      },
      {
        "logsig": 1.305671716064918,
        "node": "Node256neg",
        "diff": 0.0039197975337638075
      },
      {
        "logsig": 0,
        "node": "Node257neg",
        "diff": -0.0005316436193521713
      },
      {
        "logsig": 0,
        "node": "Node258neg",
        "diff": -0.0001901176993763404
      },
      {
        "logsig": 0,
        "node": "Node259neg",
        "diff": -0.0016039369554879045
      },
      {
        "logsig": 0,
        "node": "Node260neg",
        "diff": 0.004796860325914393
      },
      {
        "logsig": 0,
        "node": "Node261neg",
        "diff": 0.005565602083037472
      },
      {
        "logsig": 0,
        "node": "Node262neg",
        "diff": -0.000993544851699107
      },
      {
        "logsig": 0,
        "node": "Node263neg",
        "diff": -0.0003605701962326834
      },
      {
        "logsig": 1.2020750061207663,
        "node": "Node264neg",
        "diff": 0.004913829505252142
      },
      {
        "logsig": 0,
        "node": "Node265neg",
        "diff": -0.0017756811292183687
      },
      {
        "logsig": 0,
        "node": "Node266neg",
        "diff": 0.0012167904301523592
      },
      {
        "logsig": 2.7159112575732083,
        "node": "Node267neg",
        "diff": -0.007152678829564117
      },
      {
        "logsig": 0,
        "node": "Node268neg",
        "diff": -0.0011210996538463314
      },
      {
        "logsig": 3.9622767014290465,
        "node": "Node269neg",
        "diff": -0.010375810838784258
      },
      {
        "logsig": 0,
        "node": "Node270neg",
        "diff": -0.0003533655158089736
      },
      {
        "logsig": 0.3604391211159163,
        "node": "Node271neg",
        "diff": 0.004773251713233618
      },
      {
        "logsig": 0,
        "node": "Node272neg",
        "diff": -0.0012293608836773868
      },
      {
        "logsig": 0,
        "node": "Node273neg",
        "diff": 0.002360540741485499
      },
      {
        "logsig": 0,
        "node": "Node274neg",
        "diff": 0.002702139302794857
      },
      {
        "logsig": 0,
        "node": "Node275neg",
        "diff": 0.0017325528103200275
      },
      {
        "logsig": 3.888037974052379,
        "node": "Node276neg",
        "diff": 0.014604211611832743
      },
      {
        "logsig": 0,
        "node": "Node277neg",
        "diff": 0.002090170528378776
      },
      {
        "logsig": 0,
        "node": "Node278neg",
        "diff": -0.00011718104448066203
      },
      {
        "logsig": 0,
        "node": "Node279neg",
        "diff": -0.0004741876443556125
      },
      {
        "logsig": 0,
        "node": "Node280neg",
        "diff": 0.0016688460275765915
      },
      {
        "logsig": 0,
        "node": "Node281neg",
        "diff": 0.0043403904551580705
      },
      {
        "logsig": 3.943726326735227,
        "node": "Node282neg",
        "diff": 0.008080273124326824
      },
      {
        "logsig": 0.26202082604696625,
        "node": "Node283neg",
        "diff": 0.002255782181433402
      },
      {
        "logsig": 0,
        "node": "Node284neg",
        "diff": 0.0012753977203648955
      },
      {
        "logsig": 1.2812477217992082,
        "node": "Node285neg",
        "diff": 0.01526848192046698
      },
      {
        "logsig": 0.011086621838997349,
        "node": "Node286neg",
        "diff": 0.0030321165145333123
      },
      {
        "logsig": 0,
        "node": "Node287neg",
        "diff": -0.0005131402844774093
      },
      {
        "logsig": 1.440660333062027,
        "node": "Node288neg",
        "diff": 0.003790435241426569
      },
      {
        "logsig": 0,
        "node": "Node289neg",
        "diff": -0.003501715654068165
      },
      {
        "logsig": 0,
        "node": "Node290neg",
        "diff": 0.0029577008058561905
      },
      {
        "logsig": 3.4870962147398665,
        "node": "Node291neg",
        "diff": -0.008202985080962405
      },
      {
        "logsig": 1.049914452007827,
        "node": "Node292neg",
        "diff": 0.004439603416658141
      },
      {
        "logsig": 1.5032979719864812,
        "node": "Node293neg",
        "diff": 0.0035682180119274882
      },
      {
        "logsig": 0,
        "node": "Node294neg",
        "diff": -0.0007703918531065567
      },
      {
        "logsig": 0,
        "node": "Node295neg",
        "diff": 0.0017726029646178254
      },
      {
        "logsig": 0,
        "node": "Node296neg",
        "diff": 0.00014810022663280895
      },
      {
        "logsig": 1.3757210653418537,
        "node": "Node297neg",
        "diff": 0.0034629080364650074
      },
      {
        "logsig": 3.0672159638683683,
        "node": "Node298neg",
        "diff": 0.009237635804065726
      },
      {
        "logsig": 0,
        "node": "Node299neg",
        "diff": 0.0042274013259502394
      },
      {
        "logsig": 0,
        "node": "Node300neg",
        "diff": -0.0006939305034097237
      }
    ];
    this.selection = [];
  }
])
;
