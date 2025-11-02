import React from 'react';

const EthAddress = ({ children }) => {
  const address = children?children:"";
  const truncatedAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;

  return <span>{truncatedAddress}</span>;
};

export default EthAddress;