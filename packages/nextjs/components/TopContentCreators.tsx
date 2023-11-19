import { Box, Heading, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

export default function TopContentCreators() {
  const creators = [
    { username: "taylor-swift.eth", subscribers: 128 },
    { username: "justin-bieber.eth", subscribers: 128 },
    { username: "rihanna.eth", subscribers: 128 },
    { username: "katy-perry.eth", subscribers: 122 },
    { username: "brad-pitt.eth", subscribers: 120 },
  ];

  return (
    <Box bg="white" className="p-3"
        border="2px gray solid"
        justifyContent="space-between"
        style={{ borderRadius: "3px", height: "385px" }} >
      <Heading as="h2" size="lg" mb={4}>
        TOP 5 Content Creators
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Username</Th>
            <Th>Subscribers</Th>
          </Tr>
        </Thead>
        <Tbody>
          {creators.map((creator, index) => (
            <Tr key={index}>
              <Td>{creator.username}</Td>
              <Td isNumeric>{creator.subscribers.toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
