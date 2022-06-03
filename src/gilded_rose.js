class Item {
  constructor(name, sellIn, quality) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

class Rule {
  constructor(
    type,
    sellIn,
    qualityRules,
    quality,
    proportion,
    minimumQuality,
    maximumQuality
  ) {
    this.type = type; // RegExp to check the item name
    this.sellIn = sellIn; // unit of sellIn to change
    // rules of quality
    // {
    //   start: undefined ? Number,   ===> start date of rule
    //   end: Number ? undefined,     ===> end date of rule
    //   proportion: Number,          ===> proportion
    //   must: undefined ? Number     ===> must be changed to this number
    // }
    this.qualityRules = qualityRules;
    this.quality = quality; // unit of quality
    this.proportion = proportion; // default proportion
    this.minimumQuality = minimumQuality; // minimum quality
    this.maximumQuality = maximumQuality; // maximum quality
  }

  getQuality(sellIn) {
    let proportion = {
      value: this.proportion,
      must: undefined,
    };

    const filteredQualities = this.qualityRules.filter((quality) => {
      if (quality.start !== undefined && quality.start > sellIn) {
        return false;
      }
      if (quality.end !== undefined && quality.end <= sellIn) {
        return false;
      }
      return true;
    });

    if (filteredQualities.length) {
      proportion = {
        value: filteredQualities[0].proportion,
        must: filteredQualities[0].must,
      };
    }

    return {
      value: this.quality * proportion.value,
      must: proportion.must,
    };
  }
}

class Shop {
  constructor(items = []) {
    this.items = items;

    this.rules = [
      new Rule(
        /^Aged Brie/,
        1,
        [
          {
            start: undefined,
            end: 0,
            proportion: 2,
          },
          {
            start: 0,
            end: undefined,
            proportion: 1,
          },
        ],
        -1,
        1,
        0,
        50
      ),
      new Rule(/^Sulfuras/, 0, [], 0, 0),
      new Rule(
        /^Backstage passes/,
        1,
        [
          {
            end: 0,
            proportion: 1,
            must: 0,
          },
          {
            start: 0,
            end: 5,
            proportion: 3,
          },
          {
            start: 5,
            end: 10,
            proportion: 2,
          },
          {
            start: 10,
            proportion: 1,
          },
        ],
        -1,
        1,
        0,
        50
      ),
      new Rule(
        /^Conjured/,
        1,
        [
          {
            start: undefined,
            end: 0,
            proportion: 2,
          },
          {
            start: 0,
            end: undefined,
            proportion: 1,
          },
        ],
        2,
        1,
        0,
        50
      ),
    ];
    this.normal = new Rule(
      null,
      1,
      [
        {
          start: undefined,
          end: 0,
          proportion: 2,
        },
        {
          start: 0,
          end: undefined,
          proportion: 1,
        },
      ],
      1,
      1,
      0,
      50
    );
  }

  updateQuality() {
    this.items.forEach((item) => {
      const filteredRules = this.rules.filter((rule) =>
        rule.type.test(item.name)
      );
      let rule = this.normal;

      // normal item
      if (filteredRules.length) {
        rule = filteredRules[0];
      }

      // update sellIn
      item.sellIn -= rule.sellIn;

      // update quality
      const quality = rule.getQuality(item.sellIn);
      if (quality.must !== undefined) {
        // special condition
        item.quality = quality.must;
      } else {
        // normal calculation
        item.quality -= quality.value;
      }

      if (
        rule.minimumQuality !== undefined &&
        item.quality < rule.minimumQuality
      ) {
        // lower than minimum
        item.quality = rule.minimumQuality;
      }
      if (
        rule.maximumQuality !== undefined &&
        item.quality > rule.maximumQuality
      ) {
        // higher than maximum
        item.quality = rule.maximumQuality;
      }

      return item;
    });

    return this.items;
  }
}

module.exports = {
  Item,
  Shop,
};
