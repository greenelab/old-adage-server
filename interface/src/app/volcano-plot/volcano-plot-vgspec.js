angular.module('adage.volcano-plot-vgspec', [])

.constant('VolcanoPlotSpec', {
  "width": 500,
  "height": 350,
  "padding": "auto",
  "data": [
    {
      "name": "source"
    },
    {
      "name": "selectedSignatures",
      "modify": [
        {"type": "clear", "test": "!shift"},
        {"type": "toggle", "signal": "clickedPoint", "field": "id"}
      ]
    }
  ],

  "signals": [
    {
      "name": "tooltip",
      "init": {},
      "streams": [
        {"type": "@marks:mouseover", "expr": "datum"},
        {"type": "@marks:mouseout", "expr": "{}"}
      ]
    },
    {
      "name": "clickedPoint",
      "init": 0,
      "verbose": true,
      "streams": [{"type": "click", "expr": "datum"}]
    },
    {
      "name": "shift",
      "init": false,
      "verbose": true,
      "streams": [{"type": "click", "expr": "event.shiftKey"}]
    }
  ],

  "marks": [
    {
      "name": "marks",
      "type": "symbol",
      "from": {
        "data": "source",
        "transform": [
          {
            "type": "filter",
            "test": "datum[\"diff\"] !== null && !isNaN(datum[\"diff\"]) && datum[\"logsig\"] !== null && !isNaN(datum[\"logsig\"])"
          }
        ]
      },
      "properties": {
        "update": {
          "x": {"scale": "x", "field": "diff"},
          "y": {"scale": "y", "field": "logsig"},
          "size": {"value": 50},
          "shape": {"value": "circle"},
          "opacity": {"value": 0.7},
          "fill": [
            {
              "test": "indata('selectedSignatures', datum._id, '_id')",
              "value": "red"
            },
            {"value": "#4682b4"}
          ]
        }
      }
    },
    {
      "name": "cutoff",
      "type": "rule",
      "properties": {
        "update": {
          "x": {"value": 0},
          "x2": {"value": 500},
          "y": {"scale": "y", "value": 1.3010299956639813},
          "stroke": {"value": "#ff7f0e"}
        }
      }
    },
    {
      "type": "text",
      "properties": {
        "update": {
          "x": {"value": 502},
          "y": {"scale": "y", "value": 1.3010299956639813},
          "text": {"value": "p = 0.05"},
          "baseline": {"value": "middle"},
          "fontStyle": {"value": "italic"},
          "fill": {"value": "#ff7f0e"}
        }
      }
    },
    {
      "type": "text",
      "properties": {
        "enter": {
          "align": {"value": "center"},
          "fill": {"value": "#333"}
        },
        "update": {
          "x": {"scale": "x", "signal": "tooltip.diff"},
          "y": {"scale": "y", "signal": "tooltip.logsig", "offset": -5},
          "text": {"signal": "tooltip.name"},
          "fillOpacity": [
            {"test": "!tooltip._id", "value": 0},
            {"value": 1}
          ]
        }
      }
    }
  ],
  "scales": [
    {
      "name": "x",
      "type": "linear",
      "domain": {"data": "source", "field": "diff"},
      "rangeMin": 0,
      "rangeMax": 500,
      "round": true,
      "nice": true,
      "zero": true
    },
    {
      "name": "y",
      "type": "linear",
      "domain": {"data": "source", "field": "logsig"},
      "rangeMin": 350,
      "rangeMax": 0,
      "round": true,
      "nice": true,
      "zero": true
    }
  ],
  "axes": [
    {
      "type": "x",
      "scale": "x",
      "format": ".2f",
      "grid": true,
      "layer": "back",
      "ticks": 5,
      "title": "difference in mean activity"
    },
    {
      "type": "y",
      "scale": "y",
      "format": "s",
      "grid": true,
      "layer": "back",
      "title": "-log10(p-value)"
    }
  ]
})
;
