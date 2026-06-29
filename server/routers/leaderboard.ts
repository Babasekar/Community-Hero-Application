/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { db } from '../db';

const router = express.Router();

router.get('/', (req, res) => {
  const { role, scope, state, place } = req.query;
  let users = db.getUsers();

  if (role) {
    users = users.filter(u => u.role === role);
  }

  if (scope === 'state' && state) {
    users = users.filter(u => u.state && u.state.toLowerCase() === (state as string).toLowerCase());
  } else if (scope === 'place' && place) {
    users = users.filter(u => 
      u.place && u.place.toLowerCase() === (place as string).toLowerCase() &&
      (!state || (u.state && u.state.toLowerCase() === (state as string).toLowerCase()))
    );
  }

  // Sort by points descending and slice to top 20
  const ranked = [...users].sort((a, b) => b.points - a.points).slice(0, 20);
  res.json(ranked);
});

export default router;
