describe('Reservations', () => {
  let jwt: string;
  beforeAll(async () => {
    const user = {
      email: 'sayberkom@gmail.com',
      password: 'Password123!',
    };
    await fetch('http://auth:3001/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    const response = await fetch('http://auth:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    jwt = await response.text();
    console.log(jwt);
  });

  test('Create a reservation', async () => {
    const createdReservation = await createReservation();

    const responseGet = await fetch(`http://reservations:3000/reservations/${createdReservation._id}`, {
      headers:
        {
          Authentication: jwt
      },
    });

    const reservation = await responseGet.json();
    expect(responseGet.status).toBe(200);
    expect(createdReservation).toEqual(reservation);
  });

  const createReservation = async () => {
    const body = {
      startDate: '2024-01-01',
      endDate: '2025-01-01',
      placeId: '1',
      invoiceId: '2',
      charge: {
        amount: 900,
        card: {
          cvc: '413',
          exp_month: 12,
          exp_year: 34,
          number: '4242 4242 4242 4242',
        },
      },
    };

    const responseCreate = await fetch(
      'http://reservations:3000/reservations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authentication: jwt,
        },
        body: JSON.stringify(body),
      },
    );
    expect(responseCreate.status).toBe(201);

    return await responseCreate.json();

  }
});
