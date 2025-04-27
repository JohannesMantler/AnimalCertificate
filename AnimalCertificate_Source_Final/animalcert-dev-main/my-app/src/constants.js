export const ANIMAL_COLORS = {
    0: 'Black',
    1: 'White',
    2: 'Brown',
    3: 'Grey',
    4: 'Red',
    5: 'Orange',
    99: 'n/a'
  };

export const ANIMAL_GENDERS = {
    0: 'Female',
    1: 'Male',
    99: 'n/a'
  };

export const ANIMAL_SPECIES = {
    0: 'Dog',
    1: 'Cat',
    2: 'Horse',
    3: 'Ferret',
    4: 'Hamster',
    5: 'Guinea Pig',
    6: 'Rabbit',
    7: 'Turtle',
    8: 'Snail',
    99: 'n/a'
  };

export const ANIMAL_DISEASES = {
    0: 'Arthritis',
    1: 'Chronic kidney disease',
    2: 'Hepatitis',
    3: 'Diabetes Mellitus',
    4: 'Cushing disease',
    5: 'Addison disease',
    6: 'Cancer',
    7: 'Hyperthyroidism',
    8: 'Atopy',
    99: 'n/a'
  };  

export const ANIMAL_SPECIES_IMAGES = {
    0: `${process.env.PUBLIC_URL}/dog.png`,
    1: `${process.env.PUBLIC_URL}/cat.png`,
    2: `${process.env.PUBLIC_URL}/horse.png`,
    3: `${process.env.PUBLIC_URL}/notavailable.png`,
    4: `${process.env.PUBLIC_URL}/hamster.png`,
    5: `${process.env.PUBLIC_URL}/notavailable.png`,
    6: `${process.env.PUBLIC_URL}/rabbit.png`,
    7: `${process.env.PUBLIC_URL}/turtle.png`,
    8: `${process.env.PUBLIC_URL}/snail.png`,
    99: `${process.env.PUBLIC_URL}/notavailable.png`
  };  
  
export const validNode = (node) => (node && node.nodeType && node.nodeType === 1);

export const siftBigInt = (object) => {
  const keys = Object.keys(object);
  keys.forEach(key => {
    if (typeof object[key] === 'bigint') {
      // Convert bigint to number
      object[key] = Number(object[key]);
    } else if (Array.isArray(object[key])) {
      // Handle array containing bigint
      object[key] = object[key].map(value => typeof value === 'bigint' ? Number(value) : value);
    }
  });
  return object;
};


