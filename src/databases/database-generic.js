const chai   = require('chai');
const expect = chai.expect;

async function databaseGenericTestSuite(db) {
  const createdDocuments = [];
  var id;
  describe('Empty database', async function() {
    it('Should return an empty list', async function() {
      const result = await db.readMany('Car');

      expect(result).to.be.an('object');
      expect(result).to.not.be.empty;
      expect(result.documents).to.be.an('array');
      expect(result.count).to.be.equal(0);
    });
  });

  /********
  CREATE
  */
  describe('Create elements', async function() {
    it('Should add one element to the database', async function() {
      const result = await db.create('Car', {
        brand : 'Tesla',
        model : 'Model S',
        serial : 'A',
      });

      expect(result.brand).to.be.equal('Tesla');
      expect(result.model).to.be.equal('Model S');
      expect(result.serial).to.be.equal('A');
      id = result.id;

      createdDocuments.push(result);
    });

    it('Should use defaults on missing fields', async function() {
      const result = await db.create('Car', {brand: 'Audi', serial: 'B'});
      expect(result.brand).to.be.equal('Audi');
      expect(result.model).to.be.equal('Default Model');
      expect(result.serial).to.be.equal('B');

      createdDocuments.push(result);
    });

    it('Should ignore unknown fields', async function() {
      const result = await db.create('Car', {brand: 'Alpha Romeo', price: '112$', serial: 'C'});

      expect(result.brand).to.be.equal('Alpha Romeo');
      expect(result.serial).to.be.equal('C');
      expect(result.price).to.be.undefined;

      createdDocuments.push(result);
    });

    it('Should fail when required fields are missing', async function() {
      try {
        await db.create('Car', {model: 'A1', serial: 'BBBBB'});
      }
      catch (error) {
        expect(error).to.not.be.null;
      }
    });

    it('Should fail on duplicated unique field', async function() {
      try {
        await db.create('Car', {serial: 'A'});
      }
      catch (error) {
        expect(error).to.not.be.null;
      }
    });
  });


  /********
  READ
  */
  describe('Retrieve elements', async function() {

    it('Should retrieve one element by id', async function() {
      const result = await db.readOne('Car', id);

      expect(result.brand).to.be.equal('Tesla');
      expect(result.model).to.be.equal('Model S');
      expect(result.serial).to.be.equal('A');
    });

    it('Should retrieve all elements', async function() {
      const result = await db.readMany('Car');

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(3);

      expect(result.documents).to.be.an('array');
      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');
      expect(result.documents[2]).to.be.an('object');

      for (let i = 0; i < createdDocuments.length; i++) {
        expect(createdDocuments).to.deep.include(result.documents[i]);
      }

      expect(result.cursor).to.be.equal(result.documents[result.documents.length - 1].id);
    });

    /*******
    QUERY
    */
    it('Should handle pagination', async function() {
      await db.create('Car', {brand: 'Renault', model: 'Megane', serial: 'D'});
      await db.create('Car', {brand: 'Peugeot', model: '208', serial: 'E'});
      await db.create('Car', {brand: 'Mercedes', model: 'AMG', serial: 'F'});
      await db.create('Car', {brand: 'Ford', model: 'Anglia', serial: 'G'});

      let page = 0,
      pageSize = 2;

      const result = await db.readMany('Car', {pageSize, page});

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');
      expect(result.documents.length).to.be.equal(pageSize);

      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');
      expect(result.documents[2]).to.be.undefined;

      page = 2;
      const result2 = await db.readMany('Car', {pageSize, page});

      expect(result2).to.be.an('object');
      expect(result2.count).to.be.equal(7);

      expect(result2.documents).to.be.an('array');
      expect(result2.documents.length).to.be.equal(pageSize);

      expect(result2.documents[0]).to.be.an('object');
      expect(result2.documents[1]).to.be.an('object');
      expect(result2.documents[2]).to.be.undefined;
    });

    it('Should get the element according to their name', async function() {
      const result = await db.readMany('Car', { sort: 'brand' });

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');

      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');
      expect(result.documents[2]).to.be.an('object');
      expect(result.documents[3]).to.be.an('object');

      expect(result.documents[0].brand).to.be.equal('Alpha Romeo');
      expect(result.documents[1].brand).to.be.equal('Audi');
      expect(result.documents[2].brand).to.be.equal('Ford');
      expect(result.documents[3].brand).to.be.equal('Mercedes');

      expect(result.documents[0].model).to.be.equal('Default Model');
      expect(result.documents[1].model).to.be.equal('Default Model');
      expect(result.documents[2].model).to.be.equal('Anglia');
      expect(result.documents[3].model).to.be.equal('AMG');

      expect(result.documents[0].serial).to.be.equal('C');
      expect(result.documents[1].serial).to.be.equal('B');
      expect(result.documents[2].serial).to.be.equal('G');
      expect(result.documents[3].serial).to.be.equal('F');
    });

    it('Should get the element in descandant order', async function() {
      const result = await db.readMany('Car', { sort: 'brand', order: 'desc' });

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');

      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');
      expect(result.documents[2]).to.be.an('object');
      expect(result.documents[3]).to.be.an('object');

      expect(result.documents[0].brand).to.be.equal('Tesla');
      expect(result.documents[1].brand).to.be.equal('Renault');
      expect(result.documents[2].brand).to.be.equal('Peugeot');
      expect(result.documents[3].brand).to.be.equal('Mercedes');

      expect(result.documents[0].model).to.be.equal('Model S');
      expect(result.documents[1].model).to.be.equal('Megane');
      expect(result.documents[2].model).to.be.equal('208');
      expect(result.documents[3].model).to.be.equal('AMG');

      expect(result.documents[0].serial).to.be.equal('A');
      expect(result.documents[1].serial).to.be.equal('D');
      expect(result.documents[2].serial).to.be.equal('E');
      expect(result.documents[3].serial).to.be.equal('F');
    });

    it('Should get the element with highest value1 but lower value2', async function() {
      const value1 = 'model,desc';
      const value2 = 'brand,asc';

      const result = await db.readMany('Car', { sort: [value1, value2] });

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');

      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');
      expect(result.documents[2]).to.be.an('object');
      expect(result.documents[3]).to.be.an('object');

      expect(result.documents[0].brand).to.be.equal('Tesla');
      expect(result.documents[1].brand).to.be.equal('Renault');
      expect(result.documents[2].brand).to.be.equal('Alpha Romeo');
      expect(result.documents[3].brand).to.be.equal('Audi');

      expect(result.documents[0].model).to.be.equal('Model S');
      expect(result.documents[1].model).to.be.equal('Megane');
      expect(result.documents[2].model).to.be.equal('Default Model');
      expect(result.documents[3].model).to.be.equal('Default Model');

      expect(result.documents[0].serial).to.be.equal('A');
      expect(result.documents[1].serial).to.be.equal('D');
      expect(result.documents[2].serial).to.be.equal('C');
      expect(result.documents[3].serial).to.be.equal('B');
    });

    /******
    CURSOR
    */
    it('Should get the elements after the cursor', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      const cursor = documents[2].id.toString();

      const result = await db.readMany('Car', { cursor });

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');
      expect(result.documents.length).to.be.equal(documents.length - 3);

      expect(result.documents[0]).to.be.an('object');
      expect(result.documents[1]).to.be.an('object');

      expect(result.documents[0].brand).to.be.equal(documents[3].brand);
      expect(result.documents[1].brand).to.be.equal(documents[4].brand);

      expect(result.documents[0].model).to.be.equal(documents[3].model);
      expect(result.documents[1].model).to.be.equal(documents[4].model);

      expect(result.documents[0].serial).to.be.equal(documents[3].serial);
      expect(result.documents[1].serial).to.be.equal(documents[4].serial);
    });

    it('Should get a response with an empty data', async function() {
      const response  = await db.readMany('Car');
      let last_id = response.cursor.toString();

      const result = await db.readMany('Car', { cursor: last_id });

      expect(result).to.be.an('object');
      expect(result).to.not.be.empty;
      expect(result.documents).to.be.an('array');
      expect(result.documents).to.be.empty;
      expect(result.count).to.be.equal(7);
    });

    it('Should get the element in orderby name and in descandant order starting after cursor', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      documents.sort((a, b) => (a.id > b.id) ? 1 : -1);

      const cursor = 'brand;' + documents[4].brand + ';' + documents[4].id;
      const result = await db.readMany('Car', { cursor, sort: 'brand', order: 'desc' });

      expect(result).to.be.an('object');
      expect(result.count).to.be.equal(7);

      expect(result.documents).to.be.an('array');

      if (result.documents[0]) {
        expect(result.documents[0]).to.be.an('object');
        expect(result.documents[0].brand < documents[4].brand).to.be.true;
      }
      if (result.documents[1]) {
        expect(result.documents[1]).to.be.an('object');
        expect(result.documents[1].brand < result.documents[0].brand).to.be.true;
      }
    });
  });

  /********
  UPDATE
  */
  describe('Update elements', async function() {
    it('Should update the element at id', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      documents.sort((a, b) => (a.id > b.id) ? 1 : -1);

      const result = await db.update('Car', documents[2].id, {brand: 'Daccia', model: 'Sandero', serial:'Z'});

      expect(result.brand).to.be.equal('Daccia');
      expect(result.model).to.be.equal('Sandero');
      expect(result.serial).to.be.equal('Z');
      expect(result.id.toString()).to.be.equal(documents[2].id.toString());
    });

    it('Should only change one field of the element at id', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      documents.sort((a, b) => (a.id > b.id) ? 1 : -1);

      const result = await db.patch('Car', documents[2].id, { brand: 'Dacia'} );

      expect(result.brand).to.be.equal('Dacia');
      expect(result.serial).to.be.equal(documents[2].serial);
      expect(result.id.toString()).to.be.equal(documents[2].id.toString());
    });

    it('Should fail when required fields are missing', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      try {
        await db.update('Car', documents[2].id, {model: 'Romero'});
      }
      catch (err) {
        expect(err).to.not.be.null;
      }
    });

    it('Should fail on duplicated unique field', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      try {
        await db.update('Car', documents[2].id, {serial: 'A'});
      }
      catch (err) {
        expect(err).to.not.be.null;
      }
    });
  });

  /********
  DELETE
  */
  describe('Delete elements', async function() {
    it('Should delete the element at id', async function() {
      const response  = await db.readMany('Car');
      const documents = response.documents;

      documents.sort((a, b) => (a.id > b.id) ? 1 : -1);

      const result = await db.remove('Car', documents[1].id);

      expect(result.deleted).to.be.equal(1);

      try {
        await db.readOne('Car', documents[1].id);
      }
      catch (err) {
        expect(err).to.not.be.null;
      }
    });
  });
}

module.exports = databaseGenericTestSuite
